import { create } from 'zustand'

export const useCourseStore = create((set) => ({
  courses: [],
  enrollments: [],
  currentCourse: null,
  setCourses: (courses) => set({ courses }),
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setEnrollments: (enrollments) => set({ enrollments }),
}))
