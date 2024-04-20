
import { result } from '../../component'
import instance from '../../utils/request'
const resourceService = {
  queryPage(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/resources/query', params).then((res: any) => {
        console.log(res);
        
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  save(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/resources/add', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  update(params: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/resources/update', params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
  remove(params: any, id: any): Promise<result> {
    return new Promise((resolve, reject) => {
      instance.post('/v1/api/admin/resources/delete/' + id, params).then((res: any) => {
        resolve(new result(res.code, res.message, res.data))
      })
    })
  },
}


export default resourceService
