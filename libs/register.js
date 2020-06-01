'use strict';
(function () {
    'use strict';

    let options = {
        regType: "phone",
        bonusType: "sport",

        tabButtonClass: ".tab",// set each tab data-register-type attribute email and phone
        formEmailClass: ".form-email", // email section
        formPhoneClass: ".form-phone", // phone section
        buttonActionClass: ".button-action", // submit
        emailInputClass: ".email-input",// email input
        passwordInputClass: ".password-input",
        passwordInput2Class: ".password-input2",
        phoneInputClass: ".phone-input", // phone input
        emailCountry: ".email-country",// countries select list
        phonePrefixSelect: ".phone-prefix__select",// phone codes select list
        phonePrefixCode: ".phone-prefix__code", //show current phone code
        phoneCurrency: ".phone-currency",// currencies select list for phone section
        emailCurrency: ".email-currency",// currencies select list for email section
        phonePrefixFlag: ".phone-prefix__flag", // country flag for phone-prefix

        emailErrorClass: ".email-error",
        passwordErrorClass: ".password-error",
        password2ErrorClass: ".password2-error",
        phoneErrorClass: ".phone-error",
        ofertaAgreementInputId: "#oferta-agreement",
    };

    let App = function App() {
        this.params = {
            mbHost: '',
            cid: null
        };
        this.init();
        this.getMostbetHost()
    };

    App.prototype = {
        init: function () {
            let _this = this;

            this.regType = options.regType;
            this.bonusType = options.bonusType;

            this.tabButtons = document.querySelectorAll(options.tabButtonClass);
            this.formEmail = document.querySelector(options.formEmailClass);
            this.formPhone = document.querySelector(options.formPhoneClass);
            this.buttonAction = document.querySelector(options.buttonActionClass);
            this.emailInput = document.querySelector(options.emailInputClass);
            this.passwordInput = document.querySelector(options.passwordInputClass);
            this.passwordInput2 = document.querySelector(options.passwordInput2Class);
            this.phoneInput = document.querySelector(options.phoneInputClass);

            this.emailError = document.querySelector(options.emailErrorClass);
            this.passwordError = document.querySelector(options.passwordErrorClass);
            this.password2Error = document.querySelector(options.password2ErrorClass);
            this.phoneError = document.querySelector(options.phoneErrorClass);

            this.ofertaAgreementInput = document.querySelector(options.ofertaAgreementInputId);

            if (this.formEmail && this.formPhone) {
                if (this.regType === 'email') {
                    this.formPhone.style.display = 'none';
                } else {
                    this.formEmail.style.display = 'none';
                }
            }
            if (this.tabButtons) {
                [].forEach.call(this.tabButtons, function (tabButton) {
                    tabButton.addEventListener('click', _this.changeRegType.bind(_this));
                });
            }
            if (this.ofertaAgreementInput) {
                this.ofertaAgreementInput.checked = true;
            }
            if (this.emailInput) this.emailInput.addEventListener('change', function (event) {
                _this.showError({field: 'email', message: ''});
            });
            if (this.passwordInput) this.passwordInput.addEventListener('change', function (event) {
                _this.showError({field: 'password', message: ''});
            });
            if (this.passwordInput2) this.passwordInput2.addEventListener('change', function (event) {
                _this.showError({field: 'password2', message: ''});
            });
            if (this.phoneInput) {
                this.phoneInput.addEventListener('change', function (event) {
                    _this.showError({field: 'phone', message: ''});
                });
            }
            if (this.buttonAction) this.buttonAction.addEventListener('click', function (event) {
                _this.submit()
            });
        },
        ajax: function (params) {
            let xhr = new XMLHttpRequest;
            params.contentType = params.contentType || 'application/x-www-form-urlencoded';
            xhr.open(params.method, params.url, true);
            xhr.setRequestHeader('Content-Type', params.contentType);
            xhr.withCredentials = params.withCredentials || false;
            xhr.send(params.data || '');
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) {
                    console.warn('ajax error', xhr.response)
                }
                if (typeof params.onDone === 'function') params.onDone(xhr.response)
            }
        },
        getFormFields: function (callback) {
            this.ajax({
                url: this.params.mbHost + '/api/v1/external-register.json',
                method: 'GET',
                onDone: function onDone(data) {
                    if (typeof callback === 'function') callback(JSON.parse(data))
                }
            })
        },
        urlGET: function (name) {
            const value = name ? new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)').exec(location.search) : null;
            return value === null ? '' : decodeURIComponent(value[1]);
        },
        JSONP: function (url) {
            let script = document.createElement('script');
            script.async = true;
            script.setAttribute('src', url);
            document.body.appendChild(script)
        },
        getMostbetHost: function () {
            let _this = this;
            window.lMostpartner = {
                changeLinksUrl: function changeLinksUrl(data) {
                    _this.params.redirectUrl = data.redirectUrl;
                    _this.params.mbHost = data.mbHost;
                    _this.getFormFields(function (data) {
                        // _this.removeLoader(document.body);
                        _this.initComponents(data.fields)
                    })
                }
            };
            this.params.cid = this.urlGET('cid');
            this.JSONP(location.protocol + '//' + this.urlGET('h') + '/transit-view?cid=' + this.params.cid + '&callback=lMostpartner.changeLinksUrl')
        },
        getCountryOptions: function (options) {
            let data = [];
            for (let property in options) {
                data.push({
                    id: options[property],
                    text: property
                })
            }
            return {
                data: data,
                width: '100%',
                language: {
                    noResults: function noResults() {
                        return '\u0421\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E'
                    }
                }
            }
        },
        getPhoneNumberOptions: function (options) {
            let setFlag = function setFlag(state) {
                if (state.disabled) return false;
                var template = $('<img class="' + options.phonePrefixFlag + '" src="./svg/' + state.id.toLowerCase() + '.svg">');
                return template
            };
            let data = [];
            for (let property in options) {
                data.push({
                    id: property,
                    text: options[property]
                })
            }
            return {
                data: data,
                width: '60px',
                templateSelection: setFlag,
                templateResult: setFlag,
                language: {
                    noResults: function noResults() {
                        return ''
                    }
                }
            }
        },
        initComponents: function (fieldsData) {
            this.phonePrefixes = fieldsData.mobile_registration_form.fields.phonePrefix.choices;
            this.phonePrefix = fieldsData.mobile_registration_form.fields.phonePrefixDefault.choices[0];

            let _this = this;
            $(options.phonePrefixSelect).select2(this.getPhoneNumberOptions(this.phonePrefixes)).val(this.phonePrefix).trigger('change').on('change', function (event) {
                $(options.phonePrefixCode).text('+' + _this.phonePrefixes[this.value]);
            });
            $(options.phonePrefixCode).text('+' + this.phonePrefixes[this.phonePrefix]);

            this.countries = fieldsData.email_registration_form.fields.country.choices;
            this.country = fieldsData.email_registration_form.fields.defaultCountry.choices[0];
            $(options.emailCountry).select2(this.getCountryOptions(this.countries)).val(this.countries[this.country]).trigger('change');

            this.currencies = fieldsData.mobile_registration_form.fields.currencyId.choices;
            this.currency = fieldsData.mobile_registration_form.fields.activeCurrencyCode.choices[0];
            $(options.phoneCurrency).select2(this.getCountryOptions(this.currencies)).val(this.currencies[this.currency]).trigger('change');
            $(options.emailCurrency).select2(this.getCountryOptions(this.currencies)).val(this.currencies[this.currency]).trigger('change');
        },
        changeRegType: function (event) {
            if (event.currentTarget.classList.contains('active')) return;
            [].forEach.call(this.tabButtons, function (tabButton) {
                tabButton.classList.remove('active')
            });
            event.currentTarget.classList.add('active');
            if (this.regType === 'email') {
                this.formPhone.style.display = 'block';
                this.formEmail.style.display = 'none';
            } else {
                this.formPhone.style.display = 'none';
                this.formEmail.style.display = 'block';
            }
            this.regType = event.currentTarget.getAttribute('data-register-type');
        },
        showError: function (error) {
            switch (error.field) {
                case "email":
                    if (this.emailError) this.emailError.innerText = error.message;
                    break;
                case "password":
                    if (this.passwordError) this.passwordError.innerHTML = error.message;
                    break;
                case "password2":
                    if (this.password2Error) this.password2Error.innerHTML = error.message;
                    break;
                case "phone":
                    if (this.phoneError) this.phoneError.innerHTML = error.message;
                    break;
            }
        },
        validate: function () {
            let messages = {
                required: '\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u043F\u043E\u043B\u0435',
                phone: {
                    incorrect: '\u041D\u0435\u043A\u043A\u043E\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430'
                },
                email: {
                    incorrect: '\u0410\u0434\u0440\u0435\u0441 \u0432 \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E\u043C \u0444\u043E\u0440\u043C\u0430\u0442\u0435',
                    symbolNotFound: '\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0441\u0438\u043C\u0432\u043E\u043B \u201C@\u201C. \u0412 \u0430\u0434\u0440\u0435\u0441\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0441\u0438\u043C\u0432\u043E\u043B "@"',
                    addressIsNotFull: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044C \u0430\u0434\u0440\u0435\u0441\u0430 \u043F\u043E\u0441\u043B\u0435 \u0441\u0438\u043C\u0432\u043E\u043B\u0430 \u201C@\u201C. \u0410\u0434\u0440\u0435\u0441 \u043D\u0435 \u043F\u043E\u043B\u043D\u044B\u0439'
                },
                password: {
                    minLength: '\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432: 6. \u0421\u0435\u0439\u0447\u0430\u0441: %current_length%'
                },
                repeatPassword: {
                    discrepancy: '\u0412\u0432\u0435\u0434\u0435\u043D\u043D\u044B\u0435 \u043F\u0430\u0440\u043E\u043B\u0438 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442'
                },
                ofertaAgreement: {
                    notChecked: '\u041F\u043E\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0441\u0432\u043E\u0435 \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u0441 \u043F\u0440\u0430\u0432\u0438\u043B\u0430\u043C\u0438'
                }
            };
            if (this.regType === 'phone') {
                const phoneValue = parseInt(this.phoneInput.value.replace(/[^\d]/g, ''));
                if (phoneValue.length === 0) {
                    this.showError({
                        field: 'phone',
                        message: messages.required
                    });
                    return false
                } else if (!isFinite(phoneValue)) {
                    this.showError({
                        field: 'phone',
                        message: messages.phone.incorrect
                    });
                    return false
                }
            }
            if (this.regType === 'email') {
                const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (this.emailInput.value.length === 0) {
                    this.showError({
                        field: 'email',
                        message: messages.required
                    });
                    return false
                } else if (this.emailInput.value.indexOf('@') === -1) {
                    this.showError({
                        field: 'email',
                        message: messages.email.symbolNotFound
                    });
                    return false
                } else if (!this.emailInput.value[this.emailInput.value.indexOf('@') + 1]) {
                    this.showError({
                        field: 'email',
                        message: messages.email.addressIsNotFull
                    });
                    return false
                } else if (!emailReg.test(this.emailInput.value.toLowerCase())) {
                    this.showError({
                        field: 'email',
                        message: messages.email.incorrect
                    });
                    return false
                }
                if (this.passwordInput.value.length === 0) {
                    this.showError({
                        field: 'password',
                        message: messages.required
                    });
                    return false
                } else if (this.passwordInput.value.length < 6) {
                    this.showError({
                        field: 'password',
                        message: messages.password.minLength.replace('%current_length%', this.passwordInput.value.length)
                    });
                    return false
                }
                if (this.passwordInput2) {
                    if (this.passwordInput2.value.length === 0) {
                        this.showError({
                            field: 'password2',
                            message: messages.required
                        });
                        return false
                    } else if (this.passwordInput2.value.length < 6) {
                        this.showError({
                            field: 'password2',
                            message: messages.password.minLength.replace('%current_length%', this.passwordInput2.value.length)
                        });
                        return false
                    } else if (this.passwordInput2.value !== this.passwordInput.value) {
                        this.showError({
                            field: 'password2',
                            message: messages.repeatPassword.discrepancy
                        });
                        return false
                    }
                }
            }
            return true
        },
        submit: function () {
            if (!this.validate()) return false;
            const ofertaAgreement = this.ofertaAgreementInput ? +this.ofertaAgreementInput.checked : 1;
            const countryId = $(options.emailCountry).val() || this.countries[this.country];
            if (this.regType === 'email') {
                const currencyId = $(options.emailCurrency).val() || this.currencies[this.currency];
                this.register({
                    email: this.emailInput.value,
                    plainPasswordFirst: this.passwordInput.value,
                    plainPasswordSecond: this.passwordInput2 ? this.passwordInput2.value : this.passwordInput.value,
                    currencyId: currencyId,
                    countryId: countryId,
                    ofertaAgreement: ofertaAgreement,
                    bonusType: this.bonusType,
                })
            }
            if (this.regType === 'phone') {
                const currencyId = $(options.phoneCurrency).val() || this.currencies[this.currency];
                const phonePrefix = this.phonePrefixes[$(options.phonePrefixSelect).val()];
                this.register({
                    phoneNumber: phonePrefix + this.phoneInput.value.replace(/[^\d]/g, ''),
                    currencyId: currencyId || this.currency,
                    countryId: countryId || this.country,
                    ofertaAgreement: ofertaAgreement,
                    bonusType: this.bonusType,
                })
            }
        },
        register: function (fields) {
            console.log('fields', fields);
            let _this = this;
            let redirectUrl = this.params.redirectUrl;
            let data = '';
            let url = '';

            if (this.regType === 'email') {
                url = this.params.mbHost + '/api/v1/external-register-email.json?cid=' + this.params.cid;
                data = 'email_registration_form[email]=' + encodeURIComponent(fields.email) +
                    '&email_registration_form[plainPassword][first]=' + encodeURIComponent(fields.plainPasswordFirst) +
                    '&email_registration_form[plainPassword][second]=' + encodeURIComponent(fields.plainPasswordSecond) +
                    '&email_registration_form[currencyId]=' + encodeURIComponent(fields.currencyId) +
                    '&email_registration_form[country]=' + encodeURIComponent(fields.countryId);
                if (fields.bonusType) {
                    data += '&email_registration_form[first_refill_bonus_type_choice]=' + fields.bonusType
                }
            }
            if (this.regType === 'phone') {
                url = this.params.mbHost + '/api/v1/external-register-mobile.json?cid=' + this.params.cid;
                data = 'mobile_registration_form[phoneNumber]=' + encodeURIComponent(fields.phoneNumber) +
                    '&mobile_registration_form[country]=' + encodeURIComponent(fields.countryId) +
                    '&mobile_registration_form[currencyId]=' + encodeURIComponent(fields.currencyId);
                if (fields.bonusType) {
                    data += '&mobile_registration_form[first_refill_bonus_type_choice]=' + fields.bonusType
                }
            }

            this.ajax({
                url: url,
                method: 'POST',
                data: data,
                withCredentials: true,
                onDone: function onDone(data) {
                    let response = JSON.parse(data);
                    if (response.status === 'error') {
                        if (response.errors) {
                            if (response.errors.form_errors.length) {
                                _this.showError({
                                    field: _this.regType,
                                    message: response.errors.form_errors[0]
                                })
                            } else if (response.errors.phonePrefix && response.errors.phonePrefix.length) {
                                _this.showError({field: 'phone', message: response.errors.phonePrefix[0]})
                            } else if (response.errors.phoneNumber && response.errors.phoneNumber.length) {
                                _this.showError({field: 'phone', message: response.errors.phoneNumber[0]})
                            } else if (response.errors.email && response.errors.email.length) {
                                _this.showError({field: 'email', message: response.errors.email[0]})
                            } else if (response.errors.plainPassword && response.errors.plainPassword.length) {
                                _this.showError({field: 'password', message: response.errors.plainPassword[0]})
                            }
                        }
                    } else {
                        window.location.href = redirectUrl + (response.sso ? '&sso=' + response.sso : '');
                    }
                }
            })
        },
    };
    document.addEventListener('DOMContentLoaded', function () {
        window.Form = new App;
    })
})();