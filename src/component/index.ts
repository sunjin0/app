export  class result {
  code: string;
  message: string;
  data: any;

  constructor(code: any, message: any, data: any) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}