const { Client } = require('pg');
const fs = require('fs').promises;
const crypto = require('crypto');

// 案3: タグからSVGアイコン(Lucide)を簡易マッピング
function getTagIcon(tags) {
  const tagStr = (tags || []).join(' ').toLowerCase();
  let iconName = 'file-text'; // default
  if (tagStr.includes('ai') || tagStr.includes('gemini') || tagStr.includes('gpt') || tagStr.includes('llm')) {
    iconName = 'bot';
  } else if (tagStr.includes('business') || tagStr.includes('biz')) {
    iconName = 'briefcase';
  } else if (tagStr.includes('tech') || tagStr.includes('code') || tagStr.includes('dev')) {
    iconName = 'code';
  } else if (tagStr.includes('news')) {
    iconName = 'newspaper';
  }

  return `<img src="https://unpkg.com/lucide-static@latest/icons/${iconName}.svg" width="32" height="32" style="padding: 16px; background: #e5e7eb; border-radius: 16px;" />`;
}

// 案4: OGP画像のスクレイピング (簡易実装)
async function getOgImage(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const html = await res.text();
    // 正規表現で og:image の content 属性を抽出
    const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || 
                  html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (match && match[1]) {
      // 相対パスの場合は絶対パスに変換
      return new URL(match[1], url).href;
    }
  } catch (e) {
    console.error(`[OGP Fetch Error] ${url}: ${e.message}`);
  }
  return null;
}

async function main() {
  // 環境変数 DATABASE_URL が設定されていることを前提とします
  if (!process.env.DATABASE_URL) {
    console.error("エラー: 環境変数 DATABASE_URL が設定されていません。");
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // NeonDB接続用
  });

  try {
    await client.connect();
    console.log("DB接続成功。記事データを取得中...");
    
    const res = await client.query(`
      SELECT title, url, tags, thumbnail_url 
      FROM articles_enriched 
      WHERE url IS NOT NULL 
      ORDER BY id DESC 
      LIMIT 10
    `);

    const articles = res.rows;
    let htmlRows = '';

    for (const article of articles) {
      console.log(`処理中: ${article.title}`);
      
      let domain = 'unknown';
      try { domain = new URL(article.url).hostname; } catch (e) {}

      // [現状] 既存のサムネイル
      const currentIcon = article.thumbnail_url 
        ? `<img src="${article.thumbnail_url}" width="64" height="64" style="object-fit:cover; border-radius: 8px;" />` 
        : '<span style="color:#999">なし</span>';

      // [案1] Favicon (Google S2)
      const faviconImg = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=128" width="64" height="64" style="border-radius:16px;" onerror="this.style.display='none'" />`;

      // [案2] イニシャル+グラデーション (SVG)
      const initial = domain.replace(/^www\./, '').charAt(0).toUpperCase() || '?';
      const hash = crypto.createHash('md5').update(domain).digest('hex'); // ドメインごとに固有の色を生成
      const color1 = `#${hash.substring(0, 6)}`;
      const color2 = `#${hash.substring(6, 12)}`;
      const gradId = `grad_${hash.substring(0, 8)}`;
      
      const initialSvg = `
        <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${color1}" />
              <stop offset="100%" stop-color="${color2}" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#${gradId})" />
          <text x="32" y="32" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text>
        </svg>
      `;

      // [案3] タグSVG
      let parsedTags = [];
      if (typeof article.tags === 'string') {
        try { parsedTags = JSON.parse(article.tags); } catch(e) { parsedTags = [article.tags]; }
      } else if (Array.isArray(article.tags)) { parsedTags = article.tags; }
      const tagSvgHtml = getTagIcon(parsedTags);

      // [案4] OGPクロップ (CSSでの切り抜き)
      const ogUrl = await getOgImage(article.url);
      const ogHtml = ogUrl 
        ? `<img src="${ogUrl}" style="width:64px; height:64px; object-fit:cover; border-radius:50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />` 
        : '<div style="width:64px; height:64px; background:#e5e7eb; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; color:#6b7280; text-align:center;">No<br>Image</div>';

      htmlRows += `
        <tr>
          <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <a href="${article.url}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: bold;">${article.title}</a><br>
            <small style="color: #6b7280;">${domain}</small>
          </td>
          <td align="center">${currentIcon}</td>
          <td align="center" style="background: #f9fafb;">${faviconImg}</td>
          <td align="center">${initialSvg}</td>
          <td align="center" style="background: #f9fafb;">${tagSvgHtml}</td>
          <td align="center">${ogHtml}</td>
        </tr>
      `;
    }

    const htmlTemplate = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>Icon Design Comparison</title><style>body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1f2937; } table { border-collapse: collapse; width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,0.1); background: white; } th, td { border: 1px solid #e5e7eb; padding: 12px; } th { background-color: #f3f4f6; position: sticky; top: 0; }</style></head><body style="background: #f3f4f6;"><h1>記事アイコン デザイン比較プロトタイプ</h1><table><thead><tr><th>記事情報</th><th>現状 (thumbnail_url)</th><th>案1: Favicon</th><th>案2: イニシャル+グラデ</th><th>案3: タグSVG</th><th>案4: OGPクロップ</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;

    await fs.writeFile('comparison.html', htmlTemplate, 'utf-8');
    console.log("出力完了: comparison.html をブラウザで開いて確認してください。");

  } catch (err) {
    console.error("エラーが発生しました:", err);
  } finally {
    await client.end();
  }
}

main();
