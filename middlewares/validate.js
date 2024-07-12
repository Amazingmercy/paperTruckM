const Joi = require('joi')


// Validation function for user input
    const schema = Joi.object({
        schoolName: Joi.string()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .required()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .message('Please enter a valid password'),

        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Password and confirm password must match',
            }),

        email: Joi.string()
            .required()
            .email({ minDomainSegments: 2, tlds: { allow: true } })
            .message('Please enter a valid email'),

        address: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

    });



const validateUser = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        req.validateError = error.details[0].message;
        return next()
    }
    next();
};




// Export the validation functions for use in other modules
module.exports = validateUser
