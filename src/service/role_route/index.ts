
import { result } from '../../common'
import instance from '../../utils/request'
const roleRouteService = {
  queryPage(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/role_route/query/list', params).then((res: any) => {
        console.log(res);
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  save(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/role_route/add', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  update(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/role_route/update', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  remove(params: any, id: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/role_route/delete/' + id, params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
}


export default roleRouteService
