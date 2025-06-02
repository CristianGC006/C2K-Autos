const validations = {

    // ✅ VALIDACIÓN DE EMAIL
    email: {
        regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "El email debe tener un formato válido (ejemplo@correo.com)",
        validate: function(email) {
            return this.regex.test(email);
        }
    },

    // ✅ VALIDACIÓN DE CONTRASEÑA
    password: {
        // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
        validate: function(password) {
            return this.regex.test(password);
        }
    },

    // ✅ VALIDACIÓN DE CONTRASEÑA SIMPLE (más flexible)
    passwordSimple: {
        regex: /^.{6,}$/, // Mínimo 6 caracteres
        message: "La contraseña debe tener al menos 6 caracteres",
        validate: function(password) {
            return this.regex.test(password);
        }
    },

    // ✅ VALIDACIÓN DE NOMBRE COMPLETO
    fullName: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
        message: "El nombre solo puede contener letras y espacios (2-50 caracteres)",
        validate: function(name) {
            return this.regex.test(name.trim());
        }
    },

    // ✅ VALIDACIÓN DE PRIMER NOMBRE
    firstName: {
        regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,25}$/,
        message: "El nombre solo puede contener letras (2-25 caracteres)",
        validate: function(name) {
            return this.regex.test(name.trim());
        }
    },

    // ✅ VALIDACIÓN DE NÚMERO DE CELULAR COLOMBIA
    phoneNumber: {
        regex: /^(?:\+57|57)?[3][0-9]{9}$/,
        message: "Ingresa un número de celular válido (ejemplo: 3001234567 o +573001234567)",
        validate: function(phone) {
            // Remover espacios y guiones
            const cleanPhone = phone.replace(/[\s-]/g, '');
            return this.regex.test(cleanPhone);
        }
    },

 


    // ✅ VALIDACIÓN DE DOCUMENTO DE IDENTIDAD 
    documentNumber: {
        regex: /^[0-9]{6,10}$/,
        message: "El documento debe contener entre 6 y 10 dígitos",
        validate: function(document) {
            return this.regex.test(document.replace(/\s/g, ''));
        }
    },

    // ✅ VALIDACIÓN DE EDAD
    age: {
        regex: /^(?:1[8-9]|[2-9][0-9]|1[0-2][0-9])$/,
        message: "La edad debe estar entre 18 y 120 años",
        validate: function(age) {
            const numAge = parseInt(age);
            return this.regex.test(age) && numAge >= 18 && numAge <= 120;
        }
    },


    // ✅ VALIDACIÓN DE PLACA DE VEHÍCULO 
    licensePlate: {
        regex: /^[A-Z]{3}[0-9]{3}$/,
        message: "La placa debe tener el formato ABC123",
        validate: function(plate) {
            return this.regex.test(plate.toUpperCase().replace(/\s/g, ''));
        }
    },

    // ✅ FUNCIONES DE VALIDACIÓN COMBINADAS
    validateForm: function(data) {
        const errors = {};
        
        // Validar email
        if (data.email && !this.email.validate(data.email)) {
            errors.email = this.email.message;
        }
        
        // Validar nombre
        if (data.name && !this.fullName.validate(data.name)) {
            errors.name = this.fullName.message;
        }
        
        // Validar teléfono
        if (data.phone && !this.phoneNumber.validate(data.phone)) {
            errors.phone = this.phoneNumber.message;
        }
        
        // Validar contraseña
        if (data.password && !this.password.validate(data.password)) {
            errors.password = this.password.message;
        }
        
        // Validar documento
        if (data.document && !this.documentNumber.validate(data.document)) {
            errors.document = this.documentNumber.message;
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    },

    // ✅ FUNCIÓN PARA VALIDAR UN CAMPO ESPECÍFICO
    validateField: function(fieldName, value) {
        if (this[fieldName] && this[fieldName].validate) {
            return {
                isValid: this[fieldName].validate(value),
                message: this[fieldName].message
            };
        }
        return { isValid: false, message: "Campo no encontrado" };
    }
};
export default validations;