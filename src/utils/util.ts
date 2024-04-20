import { createCanvas, loadImage } from 'canvas';

export  function generateImageVerificationCode(length: number): Promise<object> {
  return new Promise((resolve, reject) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let verificationCode = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      verificationCode += characters[randomIndex];
    }
    const canvas = createCanvas(100, 30);
    const context = canvas.getContext('2d');
    context.font = '15px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(verificationCode, 50, 20);
    const url = canvas.toDataURL('image/png');
    console.log(url);
    
    resolve({code:verificationCode,url:url});
  });
}
