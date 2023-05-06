function splitTextByWidth(text, maxWidth, charWidth) {
  let result = [];
  let start = 0;
  let lineWidth = 0;
  while (start < text.length) {
    let end = start + 1;
    while (end <= text.length) {
      let char = text.charAt(end - 1);
      let charWidthPx = charWidth * (char === ' ' ? 1.5 : 1); // 空格需要加上额外宽度
      if (lineWidth + charWidthPx > maxWidth) {
        result.push(text.slice(start, end - 1)); // 将上一个子字符串保存到结果中
        start = end - 1; // 更新起始位置
        lineWidth = 0;
        break;
      }
      lineWidth += charWidthPx;
      end++;
    }
    if (end > text.length) {
      result.push(text.slice(start)); // 将最后一个子字符串保存到结果中
      break;
    }
  }
  return result;
}

module.exports = {
  splitTextByWidth,
}
