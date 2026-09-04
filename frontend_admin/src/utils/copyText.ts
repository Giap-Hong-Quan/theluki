async function copyToClipboard(text:string) {
  await navigator.clipboard.writeText(text);
  console.log('Đã sao chép vào clipboard!');
}

// Cách dùng
copyToClipboard('Chuỗi cần copy');

export default copyToClipboard;