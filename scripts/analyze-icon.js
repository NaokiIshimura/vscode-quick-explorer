const path = require('path');

/**
 * アイコンのピクセル色を分析する
 */
async function analyzeIcon() {
  try {
    // jimpを動的にインポート
    const { Jimp } = await import('jimp');

    // 元のアイコンを読み込む
    const icon = await Jimp.read(path.join(__dirname, '../icon.png'));
    const width = icon.bitmap.width;
    const height = icon.bitmap.height;

    console.log(`アイコンサイズ: ${width}x${height}`);

    // サンプルポイントの色を調査
    const samplePoints = [
      { x: 0, y: 0, label: '左上（背景）' },
      { x: width / 2, y: height / 2, label: '中央' },
      { x: 100, y: 100, label: 'ロゴ付近' },
      { x: 200, y: 100, label: 'フォルダ付近' },
    ];

    for (const point of samplePoints) {
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      const color = icon.getPixelColor(x, y);

      const r = (color >> 24) & 0xFF;
      const g = (color >> 16) & 0xFF;
      const b = (color >> 8) & 0xFF;
      const a = color & 0xFF;

      console.log(`${point.label} (${x}, ${y}): RGBA(${r}, ${g}, ${b}, ${a}) - Hex: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }

    // 色の分布を調査
    const colorMap = new Map();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = icon.getPixelColor(x, y);
        const r = (color >> 24) & 0xFF;
        const g = (color >> 16) & 0xFF;
        const b = (color >> 8) & 0xFF;
        const a = color & 0xFF;

        const key = `${r},${g},${b},${a}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }

    // 上位10色を表示
    console.log('\n上位10色:');
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [color, count] of sortedColors) {
      const [r, g, b, a] = color.split(',').map(Number);
      const percentage = (count / (width * height) * 100).toFixed(2);
      console.log(`RGBA(${r}, ${g}, ${b}, ${a}) - ${count}px (${percentage}%) - Hex: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }
  } catch (error) {
    console.error('エラーが発生しました:', error.message || String(error));
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

analyzeIcon();
