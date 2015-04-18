var Validator = angular.module('Validator', []);
Validator.service('validateName', function() {
    var nameReg = /^[a-zA-Z0-9_ -]{4,32}$/;
    return function(name) {
        if (name) {
            var clean = name.replace(/\s/g, '');
            if (clean !== '' && clean !== null && name.match(nameReg)) {
                return true;
            }
            return false;
        }
        return false;
    };
});