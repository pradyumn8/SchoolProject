/**
 * @typedef {'admin' | 'teacher'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} [name]
 * @property {UserRole} role
 */

/**
 * @typedef {'attendance' | 'parentMeeting' | 'feeDue' | 'general'} NoticeType
 */

/**
 * @typedef {Object} Notice
 * @property {number} id
 * @property {NoticeType} type
 * @property {string} title
 * @property {string} content
 * @property {{ type: 'individual' | 'bulk', targets: number[] }} recipients
 * @property {Date} created
 * @property {('email' | 'sms')[]} sentVia
 */

/**
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} name
 * @property {number} divisionId
 * @property {string} rollNumber
 * @property {string} parentName
 * @property {string} contactNumber
 * @property {string} email
 * @property {string} address
 * @property {string} [grNumber]
 */

/**
 * @typedef {Object} Division
 * @property {number} id
 * @property {string} name
 * @property {string} section
 */
