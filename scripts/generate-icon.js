const path = require('path');

/**
 * アイコンを再生成して、ロゴとフォルダアイコンを中央に配置する
 */
async function generateIcon() {
  try {
    // jimpを動的にインポート（新しいバージョン対応）
    const { Jimp } = await import('jimp');

    // 元のアイコンを読み込む
    const originalIcon = await Jimp.read(path.join(__dirname, '../icon.png'));
    const width = originalIcon.bitmap.width;
    const height = originalIcon.bitmap.height;

    console.log(`元のアイコンサイズ: ${width}x${height}`);

    // ロゴとフォルダ部分の境界を検出
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let foundContent = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = originalIcon.getPixelColor(x, y);

        // RGBAを抽出
        const r = (color >> 24) & 0xFF;
        const g = (color >> 16) & 0xFF;
        const b = (color >> 8) & 0xFF;
        const a = color & 0xFF;

        // 白いロゴ部分を検出（RGBA(248, 248, 248, 255)付近）
        const isWhiteLogo = (
          r >= 230 && r <= 255 &&
          g >= 230 && g <= 255 &&
          b >= 230 && b <= 255 &&
          a > 200
        );

        // フォルダの水色部分を検出（RGBA(134, 197, 240, 255)付近）
        const isFolder = (
          r >= 100 && r <= 170 &&
          g >= 170 && g <= 230 &&
          b >= 220 && b <= 255 &&
          a > 200
        );

        // フォルダの黄色い部分も検出
        const isFolderYellow = (
          r >= 240 && r <= 255 &&
          g >= 180 && g <= 220 &&
          b >= 100 && b <= 150 &&
          a > 200
        );

        // 白いロゴまたはフォルダ部分を検出
        if ((isWhiteLogo || isFolder || isFolderYellow) && a > 100) {
          foundContent = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!foundContent) {
      console.error('アイコンの内容を検出できませんでした');
      return;
    }

    console.log(`検出された内容の範囲: (${minX}, ${minY}) - (${maxX}, ${maxY})`);

    // 内容部分とその周辺の青い背景を含めて切り取る
    // 余白を追加してロゴとフォルダの周りの青い背景も含める
    const padding = 50; // 周辺の青い背景を含めるための余白
    const cropMinX = Math.max(0, minX - padding);
    const cropMinY = Math.max(0, minY - padding);
    const cropMaxX = Math.min(width - 1, maxX + padding);
    const cropMaxY = Math.min(height - 1, maxY + padding);

    const contentWidth = cropMaxX - cropMinX + 1;
    const contentHeight = cropMaxY - cropMinY + 1;
    const content = originalIcon.clone().crop({ x: cropMinX, y: cropMinY, w: contentWidth, h: contentHeight });

    console.log(`切り取ったサイズ（余白含む）: ${contentWidth}x${contentHeight}`);

    // 新しいキャンバスを作成（元と同じサイズ）
    const newIcon = new Jimp({ width, height, color: 0x00000000 }); // 透明背景

    // 元の画像全体を新しいキャンバスにコピー（背景を保持）
    newIcon.composite(originalIcon, 0, 0);

    // 元の位置のロゴとフォルダ部分をクリア（透明化）
    for (let y = cropMinY; y <= cropMaxY; y++) {
      for (let x = cropMinX; x <= cropMaxX; x++) {
        const color = originalIcon.getPixelColor(x, y);
        const r = (color >> 24) & 0xFF;
        const g = (color >> 16) & 0xFF;
        const b = (color >> 8) & 0xFF;
        const a = color & 0xFF;

        // 白いロゴ部分を検出
        const isWhiteLogo = (
          r >= 230 && r <= 255 &&
          g >= 230 && g <= 255 &&
          b >= 230 && b <= 255 &&
          a > 200
        );

        // フォルダの水色部分を検出
        const isFolder = (
          r >= 100 && r <= 170 &&
          g >= 170 && g <= 230 &&
          b >= 220 && b <= 255 &&
          a > 200
        );

        // フォルダの黄色い部分も検出
        const isFolderYellow = (
          r >= 240 && r <= 255 &&
          g >= 180 && g <= 220 &&
          b >= 100 && b <= 150 &&
          a > 200
        );

        // ロゴとフォルダ部分を透明化
        if (isWhiteLogo || isFolder || isFolderYellow) {
          newIcon.setPixelColor(0x00000000, x, y);
        }
      }
    }

    // 中央に配置するための座標を計算
    const centerX = Math.floor((width - contentWidth) / 2);
    const centerY = Math.floor((height - contentHeight) / 2);

    console.log(`中央配置の座標: (${centerX}, ${centerY})`);

    // 新しいアイコンに内容を中央配置で貼り付け
    newIcon.composite(content, centerX, centerY);

    // 保存
    const outputPath = path.join(__dirname, '../icon.png');
    await newIcon.write(outputPath);

    console.log('✓ アイコンが正常に生成されました: icon.png');
  } catch (error) {
    console.error('エラーが発生しました:', error.message || String(error));
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

generateIcon();
