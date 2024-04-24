
import { result } from '../../common'
import instance from '../../utils/request'
const resourceService = {
  queryPage(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/resources/query/list', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  save(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/resources/add', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  update(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/resources/update', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  remove(params: any, id: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/resources/delete/' + id, params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  saveUserRole(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/resources/user-role/add', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  removeUserRole(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/resources/user-role/delete', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
}


export default resourceService
