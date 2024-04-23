import { result } from '../../common'
import instance from '../../utils/request'




export function login(params: any): Promise<result> {
  return new Promise((resolve, reject) => {
    instance.post('/v1/api/login', params).then((res:any) => {
     if (res.data.token!==undefined) {
      localStorage.setItem('token', res.data.token)
     }
     if (res.data.path!==undefined) {
      res.data.path = JSON.parse(res.data.path)
     }
      resolve(new result(res.code,res.message,res.data))
    })
  })
}
