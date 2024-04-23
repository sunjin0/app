import { MessageInstance } from "antd/es/message/interface";

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
export type resources = {
  current: string,
  description: string,
  id: string,
  routeId: string,
  size: string,
  urls: string
}
export type role = {
  current: string,
  description: string,
  id: string,
  name: string,
  size: string
}
export type route = {
  current: string,
  description: string,
  id: string,
  parentId: string,
  path: string,
  size: string
}
export  const noAuthMessage=(res:result,messageApi:MessageInstance)=>{

  if (res.code === "403") {
    messageApi.open({
      type: "warning",
      content: res.data
    })
    return;
  }
  messageApi.open({
    type: "success",
    content: res.message
  })
}