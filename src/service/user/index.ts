import { result } from '../../common'
import instance from '../../utils/request'
const userService = {
  queryPage(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/query', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  save(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/add', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  update(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/update', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  remove(params: any, id: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/delete/' + id, params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
}


export default userService
