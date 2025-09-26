<!-- API Endpoints for iCourseLy -->

<!-- Auth -->
**POST** `/api/auth/register`➖ Register a new user
**POST** `/api/auth/login`➖ Login User
**GET** `/api/auth/profile`➖ Get logged-in user profile
**GET** `/api/auth/verify-email/:token`➖ To verify user email
**POST** `/api/auth/forgot-password`➖ To request for a new password
**POST** `/api/auth/reset-password/:token`➖ To reset a password
**POST** `/api/auth/refresh-token`➖ To get a new token

<!-- Courses -->
**POST** `/api/courses`➖ Create a new course
**GET** `/api/courses`➖ Get all courses
**GET** `/api/courses/:id`➖ Get course by ID
**PUT** `/api/courses/:id`➖ Update course (instructor only)
**DELETE** `/api/courses/:Id`➖ Delete a course (instructor only)
**GET** `/api/courses/my-courses`➖ Create a new course

<!-- Lessons -->
**POST** `/api/lessons`➖ Create a new lesson with video upload
**GET** `/api/lessons/course/:id`➖ Get lessons by course ID
**GET** `/api/lessons/:id`➖ Get lesson by ID
**PUT** `/api/lessons/:id`➖ Update lesson
**DELETE** `/api/lessons/:id`➖ Delete lesson

<!-- Comments -->
**POST** `/api/comments`➖ Add comments
**GET** `/api/comments/:courseId`➖ Get comment for a course

<!-- Progress -->
**GET** `/api/progress/lesson/:lessonId`➖ Track lesson progress
**GET** `/api/progress/course/:courseid`➖ Get user progress for a course
**POST** `/api/progress/complete` ➖ track user complete progress

<!-- Enrollment -->
**POST** `/api/enroll/:courseId`➖ Enroll in a course
**GET** `/api/enroll/:userId`➖ Get all enrolled course

<!-- Admin -->
**GET** `/api/admin/users`➖ Get all users
**PUT** `/api/admin/users/:id/role` ➖ Update a users role
**DELETE** `/api/admin/users/:id` ➖ Delete a user
**GET** `/api/admin/courses` ➖ Get all courses (admin view)
**DELETE** `/api/admin/courses/:id` ➖ Delete a course
**PUT** `/api/admin/courses/:id/approve` ➖ Approve a course
**GET** `/api/admin/analytics` ➖ Get analytic data
