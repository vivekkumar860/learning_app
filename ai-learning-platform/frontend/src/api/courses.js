import client from './client'
export const listCourses  = ()                  => client.get('/courses')
export const getCourse    = (id)                => client.get(`/courses/${id}`)
export const createCourse = (data)              => client.post('/courses', data)
export const createModule = (courseId, data)    => client.post(`/courses/${courseId}/modules`, data)
export const enroll       = (courseId)          => client.post(`/courses/${courseId}/enroll`)
