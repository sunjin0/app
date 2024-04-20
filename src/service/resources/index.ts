import { result } from '../../component'
import instance from '../../utils/request'

export function queryPage(params: any): Promise<result> {
  return new Promise((resolve, reject) => {
    instance.post('/v1/api/admin/resources/role/query', params).then((res: any) => {
      resolve(new result(res.code, res.message, res.data))
    })
  })
}
export function save(params: any): Promise<result> {
  return new Promise((resolve, reject) => {
    instance.post('/v1/api/admin/resources/role/add', params).then((res: any) => {
      resolve(new result(res.code, res.message, res.data))
    })
  })
}
export function update(params: any): Promise<result> {
  return new Promise((resolve, reject) => {
    instance.post('/v1/api/admin/resources/role/update', params).then((res: any) => {
      resolve(new result(res.code, res.message, res.data))
    })
  })
}
export function remove(params: any, id: any): Promise<result> {
  return new Promise((resolve, reject) => {
    instance.post('/v1/api/admin/resources/role/delete/' + id, params).then((res: any) => {
      resolve(new result(res.code, res.message, res.data))
    })
  })
}
