var Validator = angular.module('Validator', []);
Validator.service('validateName', function() {
    var nameReg = /^[a-z0-9_-]{4,16}$/;
    return function(name) {
        if (name) {
            var clean = name.replace(/\s/g, '');
            if (clean != '' && clean != null && name.match(nameReg)) {
                return true;
            }
            return false;
        }
        return false;
    }
});