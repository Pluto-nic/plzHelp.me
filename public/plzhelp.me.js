//var angular = require('angular');
//require('angular-ui-router');

angular.module('app', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

  // if it's a path that's not recognized, reroute to '/'
  $urlRouterProvider.otherwise('/');

  var landingPage = {
    name: 'landingPage',
    url: '/',
    templateUrl: './views/landingPage.html'
    //express turns this url into /client/landingPage/landingPage.html
  };

  var userDashboard = {
    name: 'userDashboard',
    url: '/userDashboard',
    templateUrl: './views/userDashboard.html' 
  };

  var contractorDashboard = {
    name: 'contractorDashboard',
    url: '/bookingHistory',
    templateUrl: './views/user-profile-booking-history.html'
  };

    $stateProvider
      .state(landingPage)
      .state(userDashboard)
      .state(contractorDashboard);
}]);;/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function($, undefined) {

    var $window = $(window);

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function alias(method) {
        return function() {
            return this[method].apply(this, arguments);
        };
    }

    var DateArray = (function() {
        var extras = {
            get: function(i) {
                return this.slice(i)[0];
            },
            contains: function(d) {
                // Array.indexOf is not cross-browser;
                // $.inArray doesn't work with Dates
                var val = d && d.valueOf();
                for (var i = 0, l = this.length; i < l; i++)
                    if (this[i].valueOf() === val)
                        return i;
                return -1;
            },
            remove: function(i) {
                this.splice(i, 1);
            },
            replace: function(new_array) {
                if (!new_array)
                    return;
                if (!$.isArray(new_array))
                    new_array = [new_array];
                this.clear();
                this.push.apply(this, new_array);
            },
            clear: function() {
                this.length = 0;
            },
            copy: function() {
                var a = new DateArray();
                a.replace(this);
                return a;
            }
        };

        return function() {
            var a = [];
            a.push.apply(a, arguments);
            $.extend(a, extras);
            return a;
        };
    })();


    // Picker object

    var Datepicker = function(element, options) {
        this.dates = new DateArray();
        this.viewDate = UTCToday();
        this.focusDate = null;

        this._process_options(options);

        this.element = $(element);
        this.isInline = false;
        this.isInput = this.element.is('input');
        this.component = this.element.is('.date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
        this.hasInput = this.component && this.element.find('input').length;
        if (this.component && this.component.length === 0)
            this.component = false;

        this.picker = $(DPGlobal.template);
        this._buildEvents();
        this._attachEvents();

        if (this.isInline) {
            this.picker.addClass('datepicker-inline').appendTo(this.element);
        } else {
            this.picker.addClass('datepicker-dropdown dropdown-menu');
        }

        if (this.o.rtl) {
            this.picker.addClass('datepicker-rtl');
        }

        this.viewMode = this.o.startView;

        if (this.o.calendarWeeks)
            this.picker.find('tfoot th.today')
                .attr('colspan', function(i, val) {
                    return parseInt(val) + 1;
                });

        this._allow_update = false;

        this.setStartDate(this._o.startDate);
        this.setEndDate(this._o.endDate);
        this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

        this.fillDow();
        this.fillMonths();

        this._allow_update = true;

        this.update();
        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        _process_options: function(opts) {
            // Store raw options for reference
            this._o = $.extend({}, this._o, opts);
            // Processed options
            var o = this.o = $.extend({}, this._o);

            // Check if "de-DE" style date is available, if not language should
            // fallback to 2 letter code eg "de"
            var lang = o.language;
            if (!dates[lang]) {
                lang = lang.split('-')[0];
                if (!dates[lang])
                    lang = defaults.language;
            }
            o.language = lang;

            switch (o.startView) {
                case 2:
                case 'decade':
                    o.startView = 2;
                    break;
                case 1:
                case 'year':
                    o.startView = 1;
                    break;
                default:
                    o.startView = 0;
            }

            switch (o.minViewMode) {
                case 1:
                case 'months':
                    o.minViewMode = 1;
                    break;
                case 2:
                case 'years':
                    o.minViewMode = 2;
                    break;
                default:
                    o.minViewMode = 0;
            }

            o.startView = Math.max(o.startView, o.minViewMode);

            // true, false, or Number > 0
            if (o.multidate !== true) {
                o.multidate = Number(o.multidate) || false;
                if (o.multidate !== false)
                    o.multidate = Math.max(0, o.multidate);
                else
                    o.multidate = 1;
            }
            o.multidateSeparator = String(o.multidateSeparator);

            o.weekStart %= 7;
            o.weekEnd = ((o.weekStart + 6) % 7);

            var format = DPGlobal.parseFormat(o.format);
            if (o.startDate !== -Infinity) {
                if ( !! o.startDate) {
                    if (o.startDate instanceof Date)
                        o.startDate = this._local_to_utc(this._zero_time(o.startDate));
                    else
                        o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
                } else {
                    o.startDate = -Infinity;
                }
            }
            if (o.endDate !== Infinity) {
                if ( !! o.endDate) {
                    if (o.endDate instanceof Date)
                        o.endDate = this._local_to_utc(this._zero_time(o.endDate));
                    else
                        o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
                } else {
                    o.endDate = Infinity;
                }
            }

            o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
            if (!$.isArray(o.daysOfWeekDisabled))
                o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
            o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d) {
                return parseInt(d, 10);
            });

            var plc = String(o.orientation).toLowerCase().split(/\s+/g),
                _plc = o.orientation.toLowerCase();
            plc = $.grep(plc, function(word) {
                return (/^auto|left|right|top|bottom$/).test(word);
            });
            o.orientation = {
                x: 'auto',
                y: 'auto'
            };
            if (!_plc || _plc === 'auto')
            ; // no action
            else if (plc.length === 1) {
                switch (plc[0]) {
                    case 'top':
                    case 'bottom':
                        o.orientation.y = plc[0];
                        break;
                    case 'left':
                    case 'right':
                        o.orientation.x = plc[0];
                        break;
                }
            } else {
                _plc = $.grep(plc, function(word) {
                    return (/^left|right$/).test(word);
                });
                o.orientation.x = _plc[0] || 'auto';

                _plc = $.grep(plc, function(word) {
                    return (/^top|bottom$/).test(word);
                });
                o.orientation.y = _plc[0] || 'auto';
            }
        },
        _events: [],
        _secondaryEvents: [],
        _applyEvents: function(evs) {
            for (var i = 0, el, ch, ev; i < evs.length; i++) {
                el = evs[i][0];
                if (evs[i].length === 2) {
                    ch = undefined;
                    ev = evs[i][1];
                } else if (evs[i].length === 3) {
                    ch = evs[i][1];
                    ev = evs[i][2];
                }
                el.on(ev, ch);
            }
        },
        _unapplyEvents: function(evs) {
            for (var i = 0, el, ev, ch; i < evs.length; i++) {
                el = evs[i][0];
                if (evs[i].length === 2) {
                    ch = undefined;
                    ev = evs[i][1];
                } else if (evs[i].length === 3) {
                    ch = evs[i][1];
                    ev = evs[i][2];
                }
                el.off(ev, ch);
            }
        },
        _buildEvents: function() {
            if (this.isInput) { // single input
                this._events = [
                    [this.element, {
                        focus: $.proxy(this.show, this),
                        keyup: $.proxy(function(e) {
                            if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
                                this.update();
                        }, this),
                        keydown: $.proxy(this.keydown, this)
                    }]
                ];
            } else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [this.element.find('input'), {
                        focus: $.proxy(this.show, this),
                        keyup: $.proxy(function(e) {
                            if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
                                this.update();
                        }, this),
                        keydown: $.proxy(this.keydown, this)
                    }],
                    [this.component, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            } else if (this.element.is('div')) { // inline datepicker
                this.isInline = true;
            } else {
                this._events = [
                    [this.element, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }
            this._events.push(
                // Component: listen for blur on element descendants
                [this.element, '*', {
                    blur: $.proxy(function(e) {
                        this._focused_from = e.target;
                    }, this)
                }],
                // Input: listen for blur on element
                [this.element, {
                    blur: $.proxy(function(e) {
                        this._focused_from = e.target;
                    }, this)
                }]
            );

            this._secondaryEvents = [
                [this.picker, {
                    click: $.proxy(this.click, this)
                }],
                [$(window), {
                    resize: $.proxy(this.place, this)
                }],
                [$(document), {
                    'mousedown touchstart': $.proxy(function(e) {
                        // Clicked outside the datepicker, hide it
                        if (!(
                            this.element.is(e.target) ||
                            this.element.find(e.target).length ||
                            this.picker.is(e.target) ||
                            this.picker.find(e.target).length
                        )) {
                            this.hide();
                        }
                    }, this)
                }]
            ];
        },
        _attachEvents: function() {
            this._detachEvents();
            this._applyEvents(this._events);
        },
        _detachEvents: function() {
            this._unapplyEvents(this._events);
        },
        _attachSecondaryEvents: function() {
            this._detachSecondaryEvents();
            this._applyEvents(this._secondaryEvents);
        },
        _detachSecondaryEvents: function() {
            this._unapplyEvents(this._secondaryEvents);
        },
        _trigger: function(event, altdate) {
            var date = altdate || this.dates.get(-1),
                local_date = this._utc_to_local(date);

            this.element.trigger({
                type: event,
                date: local_date,
                dates: $.map(this.dates, this._utc_to_local),
                format: $.proxy(function(ix, format) {
                    if (arguments.length === 0) {
                        ix = this.dates.length - 1;
                        format = this.o.format;
                    } else if (typeof ix === 'string') {
                        format = ix;
                        ix = this.dates.length - 1;
                    }
                    format = format || this.o.format;
                    var date = this.dates.get(ix);
                    return DPGlobal.formatDate(date, format, this.o.language);
                }, this)
            });
        },

        show: function() {
            if (!this.isInline)
                this.picker.appendTo('body');
            this.picker.show();
            this.place();
            this._attachSecondaryEvents();
            this._trigger('show');
        },

        hide: function() {
            if (this.isInline)
                return;
            if (!this.picker.is(':visible'))
                return;
            this.focusDate = null;
            this.picker.hide().detach();
            this._detachSecondaryEvents();
            this.viewMode = this.o.startView;
            this.showMode();

            if (
                this.o.forceParse &&
                (
                    this.isInput && this.element.val() ||
                    this.hasInput && this.element.find('input').val()
                )
            )
                this.setValue();
            this._trigger('hide');
        },

        remove: function() {
            this.hide();
            this._detachEvents();
            this._detachSecondaryEvents();
            this.picker.remove();
            delete this.element.data().datepicker;
            if (!this.isInput) {
                delete this.element.data().date;
            }
        },

        _utc_to_local: function(utc) {
            return utc && new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));
        },
        _local_to_utc: function(local) {
            return local && new Date(local.getTime() - (local.getTimezoneOffset() * 60000));
        },
        _zero_time: function(local) {
            return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
        },
        _zero_utc_time: function(utc) {
            return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
        },

        getDates: function() {
            return $.map(this.dates, this._utc_to_local);
        },

        getUTCDates: function() {
            return $.map(this.dates, function(d) {
                return new Date(d);
            });
        },

        getDate: function() {
            return this._utc_to_local(this.getUTCDate());
        },

        getUTCDate: function() {
            return new Date(this.dates.get(-1));
        },

        setDates: function() {
            var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
            this.update.apply(this, args);
            this._trigger('changeDate');
            this.setValue();
        },

        setUTCDates: function() {
            var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
            this.update.apply(this, $.map(args, this._utc_to_local));
            this._trigger('changeDate');
            this.setValue();
        },

        setDate: alias('setDates'),
        setUTCDate: alias('setUTCDates'),

        setValue: function() {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted).change();
                }
            } else {
                this.element.val(formatted).change();
            }
        },

        getFormattedDate: function(format) {
            if (format === undefined)
                format = this.o.format;

            var lang = this.o.language;
            return $.map(this.dates, function(d) {
                return DPGlobal.formatDate(d, format, lang);
            }).join(this.o.multidateSeparator);
        },

        setStartDate: function(startDate) {
            this._process_options({
                startDate: startDate
            });
            this.update();
            this.updateNavArrows();
        },

        setEndDate: function(endDate) {
            this._process_options({
                endDate: endDate
            });
            this.update();
            this.updateNavArrows();
        },

        setDaysOfWeekDisabled: function(daysOfWeekDisabled) {
            this._process_options({
                daysOfWeekDisabled: daysOfWeekDisabled
            });
            this.update();
            this.updateNavArrows();
        },

        place: function() {
            if (this.isInline)
                return;
            var calendarWidth = this.picker.outerWidth(),
                calendarHeight = this.picker.outerHeight(),
                visualPadding = 10,
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                scrollTop = $window.scrollTop();

            var zIndex = parseInt(this.element.parents().filter(function() {
                return $(this).css('z-index') !== 'auto';
            }).first().css('z-index')) + 9999;
            var offset = this.component ? this.component.parent().offset() : this.element.offset();
            var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
            var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
            var left = offset.left,
                top = offset.top;

            this.picker.removeClass(
                'datepicker-orient-top datepicker-orient-bottom ' +
                'datepicker-orient-right datepicker-orient-left'
            );

            if (this.o.orientation.x !== 'auto') {
                this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
                if (this.o.orientation.x === 'right')
                    left -= calendarWidth - width;
            }
            // auto x orientation is best-placement: if it crosses a window
            // edge, fudge it sideways
            else {
                // Default to left
                this.picker.addClass('datepicker-orient-left');
                if (offset.left < 0)
                    left -= offset.left - visualPadding;
                else if (offset.left + calendarWidth > windowWidth)
                    left = windowWidth - calendarWidth - visualPadding;
            }

            // auto y orientation is best-situation: top or bottom, no fudging,
            // decision based on which shows more of the calendar
            var yorient = this.o.orientation.y,
                top_overflow, bottom_overflow;
            if (yorient === 'auto') {
                top_overflow = -scrollTop + offset.top - calendarHeight;
                bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
                if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
                    yorient = 'top';
                else
                    yorient = 'bottom';
            }
            this.picker.addClass('datepicker-orient-' + yorient);
            if (yorient === 'top')
                top += height;
            else
                top -= calendarHeight + parseInt(this.picker.css('padding-top'));

            this.picker.css({
                top: top,
                left: left,
                zIndex: zIndex
            });
        },

        _allow_update: true,
        update: function() {
            if (!this._allow_update)
                return;

            var oldDates = this.dates.copy(),
                dates = [],
                fromArgs = false;
            if (arguments.length) {
                $.each(arguments, $.proxy(function(i, date) {
                    if (date instanceof Date)
                        date = this._local_to_utc(date);
                    dates.push(date);
                }, this));
                fromArgs = true;
            } else {
                dates = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
                if (dates && this.o.multidate)
                    dates = dates.split(this.o.multidateSeparator);
                else
                    dates = [dates];
                delete this.element.data().date;
            }

            dates = $.map(dates, $.proxy(function(date) {
                return DPGlobal.parseDate(date, this.o.format, this.o.language);
            }, this));
            dates = $.grep(dates, $.proxy(function(date) {
                return (
                    date < this.o.startDate ||
                    date > this.o.endDate || !date
                );
            }, this), true);
            this.dates.replace(dates);

            if (this.dates.length)
                this.viewDate = new Date(this.dates.get(-1));
            else if (this.viewDate < this.o.startDate)
                this.viewDate = new Date(this.o.startDate);
            else if (this.viewDate > this.o.endDate)
                this.viewDate = new Date(this.o.endDate);

            if (fromArgs) {
                // setting date by clicking
                this.setValue();
            } else if (dates.length) {
                // setting date by typing
                if (String(oldDates) !== String(this.dates))
                    this._trigger('changeDate');
            }
            if (!this.dates.length && oldDates.length)
                this._trigger('clearDate');

            this.fill();
        },

        fillDow: function() {
            var dowCnt = this.o.weekStart,
                html = '<tr>';
            if (this.o.calendarWeeks) {
                var cell = '<th class="cw">&nbsp;</th>';
                html += cell;
                this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
            }
            while (dowCnt < this.o.weekStart + 7) {
                html += '<th class="dow">' + dates[this.o.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function() {
            var html = '',
                i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.o.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').html(html);
        },

        setRange: function(range) {
            if (!range || !range.length)
                delete this.range;
            else
                this.range = $.map(range, function(d) {
                    return d.valueOf();
                });
            this.fill();
        },

        getClassNames: function(date) {
            var cls = [],
                year = this.viewDate.getUTCFullYear(),
                month = this.viewDate.getUTCMonth(),
                today = new Date();
            if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)) {
                cls.push('old');
            } else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)) {
                cls.push('new');
            }
            if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
                cls.push('focused');
            // Compare internal UTC date with local today, not UTC today
            if (this.o.todayHighlight &&
                date.getUTCFullYear() === today.getFullYear() &&
                date.getUTCMonth() === today.getMonth() &&
                date.getUTCDate() === today.getDate()) {
                cls.push('today');
            }
            if (this.dates.contains(date) !== -1)
                cls.push('active');
            if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
                $.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
                cls.push('disabled');
            }
            if (this.range) {
                if (date > this.range[0] && date < this.range[this.range.length - 1]) {
                    cls.push('range');
                }
                if ($.inArray(date.valueOf(), this.range) !== -1) {
                    cls.push('selected');
                }
            }
            return cls;
        },

        fill: function() {
            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
                startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
                endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
                endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
                todaytxt = dates[this.o.language].today || dates['en'].today || '',
                cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
                tooltip;
            this.picker.find('.datepicker-days thead th.datepicker-switch')
                .text(dates[this.o.language].months[month] + ' ' + year);
            this.picker.find('tfoot th.today')
                .text(todaytxt)
                .toggle(this.o.todayBtn !== false);
            this.picker.find('tfoot th.clear')
                .text(cleartxt)
                .toggle(this.o.clearBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            var prevMonth = UTCDate(year, month - 1, 28),
                day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() === this.o.weekStart) {
                    html.push('<tr>');
                    if (this.o.calendarWeeks) {
                        // ISO 8601: First week contains first thursday.
                        // ISO also states week starts on Monday, but we can be more abstract here.
                        var
                        // Start of current week: based on weekstart/current date
                        ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
                            // Thursday of this week
                            th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
                            // First Thursday of year, year from thursday
                            yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 864e5),
                            // Calendar week: ms between thursdays, div ms per day, div 7 days
                            calWeek = (th - yth) / 864e5 / 7 + 1;
                        html.push('<td class="cw">' + calWeek + '</td>');

                    }
                }
                clsName = this.getClassNames(prevMonth);
                clsName.push('day');

                if (this.o.beforeShowDay !== $.noop) {
                    var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
                    if (before === undefined)
                        before = {};
                    else if (typeof(before) === 'boolean')
                        before = {
                            enabled: before
                        };
                    else if (typeof(before) === 'string')
                        before = {
                            classes: before
                        };
                    if (before.enabled === false)
                        clsName.push('disabled');
                    if (before.classes)
                        clsName = clsName.concat(before.classes.split(/\s+/));
                    if (before.tooltip)
                        tooltip = before.tooltip;
                }

                clsName = $.unique(clsName);
                html.push('<td class="' + clsName.join(' ') + '"' + (tooltip ? ' title="' + tooltip + '"' : '') + '>' + prevMonth.getUTCDate() + '</td>');
                if (prevMonth.getUTCDay() === this.o.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

            var months = this.picker.find('.datepicker-months')
                .find('th:eq(1)')
                .text(year)
                .end()
                .find('span').removeClass('active');

            $.each(this.dates, function(i, d) {
                if (d.getUTCFullYear() === year)
                    months.eq(d.getUTCMonth()).addClass('active');
            });

            if (year < startYear || year > endYear) {
                months.addClass('disabled');
            }
            if (year === startYear) {
                months.slice(0, startMonth).addClass('disabled');
            }
            if (year === endYear) {
                months.slice(endMonth + 1).addClass('disabled');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
                .find('th:eq(1)')
                .text(year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            var years = $.map(this.dates, function(d) {
                return d.getUTCFullYear();
            }),
                classes;
            for (var i = -1; i < 11; i++) {
                classes = ['year'];
                if (i === -1)
                    classes.push('old');
                else if (i === 10)
                    classes.push('new');
                if ($.inArray(year, years) !== -1)
                    classes.push('active');
                if (year < startYear || year > endYear)
                    classes.push('disabled');
                html += '<span class="' + classes.join(' ') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        updateNavArrows: function() {
            if (!this._allow_update)
                return;

            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth();
            switch (this.viewMode) {
                case 0:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
                case 1:
                case 2:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.prev').css({
                            visibility: 'visible'
                        });
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({
                            visibility: 'hidden'
                        });
                    } else {
                        this.picker.find('.next').css({
                            visibility: 'visible'
                        });
                    }
                    break;
            }
        },

        click: function(e) {
            e.preventDefault();
            var target = $(e.target).closest('span, td, th'),
                year, month, day;
            if (target.length === 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'datepicker-switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        this._trigger('changeMonth', this.viewDate);
                                        break;
                                    case 1:
                                    case 2:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        if (this.viewMode === 1)
                                            this._trigger('changeYear', this.viewDate);
                                        break;
                                }
                                this.fill();
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

                                this.showMode(-2);
                                var which = this.o.todayBtn === 'linked' ? null : 'view';
                                this._setDate(date, which);
                                break;
                            case 'clear':
                                var element;
                                if (this.isInput)
                                    element = this.element;
                                else if (this.component)
                                    element = this.element.find('input');
                                if (element)
                                    element.val("").change();
                                this.update();
                                this._trigger('changeDate');
                                if (this.o.autoclose)
                                    this.hide();
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            this.viewDate.setUTCDate(1);
                            if (target.is('.month')) {
                                day = 1;
                                month = target.parent().find('span').index(target);
                                year = this.viewDate.getUTCFullYear();
                                this.viewDate.setUTCMonth(month);
                                this._trigger('changeMonth', this.viewDate);
                                if (this.o.minViewMode === 1) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            } else {
                                day = 1;
                                month = 0;
                                year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                this._trigger('changeYear', this.viewDate);
                                if (this.o.minViewMode === 2) {
                                    this._setDate(UTCDate(year, month, day));
                                }
                            }
                            this.showMode(-1);
                            this.fill();
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            day = parseInt(target.text(), 10) || 1;
                            year = this.viewDate.getUTCFullYear();
                            month = this.viewDate.getUTCMonth();
                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.is('.new')) {
                                if (month === 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this._setDate(UTCDate(year, month, day));
                        }
                        break;
                }
            }
            if (this.picker.is(':visible') && this._focused_from) {
                $(this._focused_from).focus();
            }
            delete this._focused_from;
        },

        _toggle_multidate: function(date) {
            var ix = this.dates.contains(date);
            if (!date) {
                this.dates.clear();
            } else if (ix !== -1) {
                this.dates.remove(ix);
            } else {
                this.dates.push(date);
            }
            if (typeof this.o.multidate === 'number')
                while (this.dates.length > this.o.multidate)
                    this.dates.remove(0);
        },

        _setDate: function(date, which) {
            if (!which || which === 'date')
                this._toggle_multidate(date && new Date(date));
            if (!which || which === 'view')
                this.viewDate = date && new Date(date);

            this.fill();
            this.setValue();
            this._trigger('changeDate');
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
            }
            if (this.o.autoclose && (!which || which === 'date')) {
                this.hide();
            }
        },

        moveMonth: function(date, dir) {
            if (!date)
                return undefined;
            if (!dir)
                return date;
            var new_date = new Date(date.valueOf()),
                day = new_date.getUTCDate(),
                month = new_date.getUTCMonth(),
                mag = Math.abs(dir),
                new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag === 1) {
                test = dir === -1
                // If going back one month, make sure month is not current month
                // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
                ? function() {
                    return new_date.getUTCMonth() === month;
                }
                // If going forward one month, make sure month is as expected
                // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
                : function() {
                    return new_date.getUTCMonth() !== new_month;
                };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function() {
                    return new_month !== new_date.getUTCMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function(date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange: function(date) {
            return date >= this.o.startDate && date <= this.o.endDate;
        },

        keydown: function(e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode === 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }
            var dateChanged = false,
                dir, newDate, newViewDate,
                focusDate = this.focusDate || this.viewDate;
            switch (e.keyCode) {
                case 27: // escape
                    if (this.focusDate) {
                        this.focusDate = null;
                        this.viewDate = this.dates.get(-1) || this.viewDate;
                        this.fill();
                    } else
                        this.hide();
                    e.preventDefault();
                    break;
                case 37: // left
                case 39: // right
                    if (!this.o.keyboardNavigation)
                        break;
                    dir = e.keyCode === 37 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveYear(focusDate, dir);
                        this._trigger('changeYear', this.viewDate);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveMonth(focusDate, dir);
                        this._trigger('changeMonth', this.viewDate);
                    } else {
                        newDate = new Date(this.dates.get(-1) || UTCToday());
                        newDate.setUTCDate(newDate.getUTCDate() + dir);
                        newViewDate = new Date(focusDate);
                        newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.focusDate = this.viewDate = newViewDate;
                        this.setValue();
                        this.fill();
                        e.preventDefault();
                    }
                    break;
                case 38: // up
                case 40: // down
                    if (!this.o.keyboardNavigation)
                        break;
                    dir = e.keyCode === 38 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveYear(focusDate, dir);
                        this._trigger('changeYear', this.viewDate);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
                        newViewDate = this.moveMonth(focusDate, dir);
                        this._trigger('changeMonth', this.viewDate);
                    } else {
                        newDate = new Date(this.dates.get(-1) || UTCToday());
                        newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
                        newViewDate = new Date(focusDate);
                        newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.focusDate = this.viewDate = newViewDate;
                        this.setValue();
                        this.fill();
                        e.preventDefault();
                    }
                    break;
                case 32: // spacebar
                    // Spacebar is used in manually typing dates in some formats.
                    // As such, its behavior should not be hijacked.
                    break;
                case 13: // enter
                    focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
                    this._toggle_multidate(focusDate);
                    dateChanged = true;
                    this.focusDate = null;
                    this.viewDate = this.dates.get(-1) || this.viewDate;
                    this.setValue();
                    this.fill();
                    if (this.picker.is(':visible')) {
                        e.preventDefault();
                        if (this.o.autoclose)
                            this.hide();
                    }
                    break;
                case 9: // tab
                    this.focusDate = null;
                    this.viewDate = this.dates.get(-1) || this.viewDate;
                    this.fill();
                    this.hide();
                    break;
            }
            if (dateChanged) {
                if (this.dates.length)
                    this._trigger('changeDate');
                else
                    this._trigger('clearDate');
                var element;
                if (this.isInput) {
                    element = this.element;
                } else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
            }
        },

        showMode: function(dir) {
            if (dir) {
                this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
            }
            this.picker
                .find('>div')
                .hide()
                .filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName)
                .css('display', 'block');
            this.updateNavArrows();
        }
    };

    var DateRangePicker = function(element, options) {
        this.element = $(element);
        this.inputs = $.map(options.inputs, function(i) {
            return i.jquery ? i[0] : i;
        });
        delete options.inputs;

        $(this.inputs)
            .datepicker(options)
            .bind('changeDate', $.proxy(this.dateUpdated, this));

        this.pickers = $.map(this.inputs, function(i) {
            return $(i).data('datepicker');
        });
        this.updateDates();
    };
    DateRangePicker.prototype = {
        updateDates: function() {
            this.dates = $.map(this.pickers, function(i) {
                return i.getUTCDate();
            });
            this.updateRanges();
        },
        updateRanges: function() {
            var range = $.map(this.dates, function(d) {
                return d.valueOf();
            });
            $.each(this.pickers, function(i, p) {
                p.setRange(range);
            });
        },
        dateUpdated: function(e) {
            // `this.updating` is a workaround for preventing infinite recursion
            // between `changeDate` triggering and `setUTCDate` calling.  Until
            // there is a better mechanism.
            if (this.updating)
                return;
            this.updating = true;

            var dp = $(e.target).data('datepicker'),
                new_date = dp.getUTCDate(),
                i = $.inArray(e.target, this.inputs),
                l = this.inputs.length;
            if (i === -1)
                return;

            $.each(this.pickers, function(i, p) {
                if (!p.getUTCDate())
                    p.setUTCDate(new_date);
            });

            if (new_date < this.dates[i]) {
                // Date being moved earlier/left
                while (i >= 0 && new_date < this.dates[i]) {
                    this.pickers[i--].setUTCDate(new_date);
                }
            } else if (new_date > this.dates[i]) {
                // Date being moved later/right
                while (i < l && new_date > this.dates[i]) {
                    this.pickers[i++].setUTCDate(new_date);
                }
            }
            this.updateDates();

            delete this.updating;
        },
        remove: function() {
            $.map(this.pickers, function(p) {
                p.remove();
            });
            delete this.element.data().datepicker;
        }
    };

    function opts_from_el(el, prefix) {
        // Derive options from element data-attrs
        var data = $(el).data(),
            out = {}, inkey,
            replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
        prefix = new RegExp('^' + prefix.toLowerCase());

        function re_lower(_, a) {
            return a.toLowerCase();
        }
        for (var key in data)
            if (prefix.test(key)) {
                inkey = key.replace(replace, re_lower);
                out[inkey] = data[key];
            }
        return out;
    }

    function opts_from_locale(lang) {
        // Derive options from locale plugins
        var out = {};
        // Check if "de-DE" style date is available, if not language should
        // fallback to 2 letter code eg "de"
        if (!dates[lang]) {
            lang = lang.split('-')[0];
            if (!dates[lang])
                return;
        }
        var d = dates[lang];
        $.each(locale_opts, function(i, k) {
            if (k in d)
                out[k] = d[k];
        });
        return out;
    }

    var old = $.fn.datepicker;
    $.fn.datepicker = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function() {
            var $this = $(this),
                data = $this.data('datepicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                var elopts = opts_from_el(this, 'date'),
                    // Preliminary otions
                    xopts = $.extend({}, defaults, elopts, options),
                    locopts = opts_from_locale(xopts.language),
                    // Options priority: js args, data-attrs, locales, defaults
                    opts = $.extend({}, defaults, locopts, elopts, options);
                if ($this.is('.input-daterange') || opts.inputs) {
                    var ropts = {
                        inputs: opts.inputs || $this.find('input[name="start"], input[name="end"]').toArray()
                    };
                    $this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
                } else {
                    $this.data('datepicker', (data = new Datepicker(this, opts)));
                }
            }
            if (typeof option === 'string' && typeof data[option] === 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined)
                    return false;
            }
        });
        if (internal_return !== undefined)
            return internal_return;
        else
            return this;
    };

    var defaults = $.fn.datepicker.defaults = {
        autoclose: false,
        beforeShowDay: $.noop,
        calendarWeeks: false,
        clearBtn: false,
        daysOfWeekDisabled: [],
        endDate: Infinity,
        forceParse: true,
        format: 'mm/dd/yyyy',
        keyboardNavigation: true,
        language: 'en',
        minViewMode: 0,
        multidate: false,
        multidateSeparator: ',',
        orientation: "auto",
        rtl: false,
        startDate: -Infinity,
        startView: 0,
        todayBtn: false,
        todayHighlight: false,
        weekStart: 0
    };
    var locale_opts = $.fn.datepicker.locale_opts = [
        'format',
        'rtl',
        'weekStart'
    ];
    $.fn.datepicker.Constructor = Datepicker;
    var dates = $.fn.datepicker.dates = {
        en: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today",
            clear: "Clear"
        }
    };

    var DPGlobal = {
        modes: [{
            clsName: 'days',
            navFnc: 'Month',
            navStep: 1
        }, {
            clsName: 'months',
            navFnc: 'FullYear',
            navStep: 1
        }, {
            clsName: 'years',
            navFnc: 'FullYear',
            navStep: 10
        }],
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function(year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat: function(format) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
                parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separators: separators,
                parts: parts
            };
        },
        parseDate: function(date, format, language) {
            if (!date)
                return undefined;
            if (date instanceof Date)
                return date;
            if (typeof format === 'string')
                format = DPGlobal.parseFormat(format);
            var part_re = /([\-+]\d+)([dmwy])/,
                parts = date.match(/([\-+]\d+)([dmwy])/g),
                part, dir, i;
            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                date = new Date();
                for (i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
            }
            parts = date && date.match(this.nonpunctuation) || [];
            date = new Date();
            var parsed = {},
                setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
                setters_map = {
                    yyyy: function(d, v) {
                        return d.setUTCFullYear(v);
                    },
                    yy: function(d, v) {
                        return d.setUTCFullYear(2000 + v);
                    },
                    m: function(d, v) {
                        if (isNaN(d))
                            return d;
                        v -= 1;
                        while (v < 0) v += 12;
                        v %= 12;
                        d.setUTCMonth(v);
                        while (d.getUTCMonth() !== v)
                            d.setUTCDate(d.getUTCDate() - 1);
                        return d;
                    },
                    d: function(d, v) {
                        return d.setUTCDate(v);
                    }
                },
                val, filtered;
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            var fparts = format.parts.slice();
            // Remove noop parts
            if (parts.length !== fparts.length) {
                fparts = $(fparts).filter(function(i, p) {
                    return $.inArray(p, setters_order) !== -1;
                }).toArray();
            }
            // Process remainder
            function match_part() {
                var m = this.slice(0, parts[i].length),
                    p = parts[i].slice(0, m.length);
                return m === p;
            }
            if (parts.length === fparts.length) {
                var cnt;
                for (i = 0, cnt = fparts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = fparts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(match_part);
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(match_part);
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                var _date, s;
                for (i = 0; i < setters_order.length; i++) {
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s])) {
                        _date = new Date(date);
                        setters_map[s](_date, parsed[s]);
                        if (!isNaN(_date))
                            date = _date;
                    }
                }
            }
            return date;
        },
        formatDate: function(date, format, language) {
            if (!date)
                return '';
            if (typeof format === 'string')
                format = DPGlobal.parseFormat(format);
            var val = {
                d: date.getUTCDate(),
                D: dates[language].daysShort[date.getUTCDay()],
                DD: dates[language].days[date.getUTCDay()],
                m: date.getUTCMonth() + 1,
                M: dates[language].monthsShort[date.getUTCMonth()],
                MM: dates[language].months[date.getUTCMonth()],
                yy: date.getUTCFullYear().toString().substring(2),
                yyyy: date.getUTCFullYear()
            };
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            date = [];
            var seps = $.extend([], format.separators);
            for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
                if (seps.length)
                    date.push(seps.shift());
                date.push(val[format.parts[i]]);
            }
            return date.join('');
        },
        headTemplate: '<thead>' +
            '<tr>' +
            '<th class="prev"></th>' +
            '<th colspan="5" class="datepicker-switch"></th>' +
            '<th class="next"></th>' +
            '</tr>' +
            '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot>' +
            '<tr>' +
            '<th colspan="7" class="today"></th>' +
            '</tr>' +
            '<tr>' +
            '<th colspan="7" class="clear"></th>' +
            '</tr>' +
            '</tfoot>'
    };
    DPGlobal.template = '<div class="datepicker">' +
        '<div class="datepicker-days">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        '<tbody></tbody>' +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '</div>';

    $.fn.datepicker.DPGlobal = DPGlobal;


    /* DATEPICKER NO CONFLICT
     * =================== */

    $.fn.datepicker.noConflict = function() {
        $.fn.datepicker = old;
        return this;
    };


    /* DATEPICKER DATA-API
     * ================== */

    $(document).on(
        'focus.datepicker.data-api click.datepicker.data-api',
        '[data-provide="datepicker"]',
        function(e) {
            var $this = $(this);
            if ($this.data('datepicker'))
                return;
            e.preventDefault();
            // component click requires us to explicitly show it
            $this.datepicker('show');
        }
    );
    $(function() {
        $('[data-provide="datepicker-inline"]').datepicker();
    });

}(window.jQuery));;/*!
 * bootstrap-select v1.5.4
 * http://silviomoreto.github.io/bootstrap-select/
 *
 * Copyright 2013 bootstrap-select
 * Licensed under the MIT license
 */

! function($) {

    'use strict';

    $.expr[':'].icontains = function(obj, index, meta) {
        return $(obj).text().toUpperCase().indexOf(meta[3].toUpperCase()) >= 0;
    };

    var Selectpicker = function(element, options, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.$element = $(element);
        this.$newElement = null;
        this.$button = null;
        this.$menu = null;
        this.$lis = null;

        //Merge defaults, options and data-attributes to make our options
        this.options = $.extend({}, $.fn.selectpicker.defaults, this.$element.data(), typeof options == 'object' && options);

        //If we have no title yet, check the attribute 'title' (this is missed by jq as its not a data-attribute
        if (this.options.title === null) {
            this.options.title = this.$element.attr('title');
        }

        //Expose public methods
        this.val = Selectpicker.prototype.val;
        this.render = Selectpicker.prototype.render;
        this.refresh = Selectpicker.prototype.refresh;
        this.setStyle = Selectpicker.prototype.setStyle;
        this.selectAll = Selectpicker.prototype.selectAll;
        this.deselectAll = Selectpicker.prototype.deselectAll;
        this.init();
    };

    Selectpicker.prototype = {

        constructor: Selectpicker,

        init: function() {
            var that = this,
                id = this.$element.attr('id');

            this.$element.hide();
            this.multiple = this.$element.prop('multiple');
            this.autofocus = this.$element.prop('autofocus');
            this.$newElement = this.createView();
            this.$element.after(this.$newElement);
            this.$menu = this.$newElement.find('> .dropdown-menu');
            this.$button = this.$newElement.find('> button');
            this.$searchbox = this.$newElement.find('input');

            if (id !== undefined) {
                this.$button.attr('data-id', id);
                $('label[for="' + id + '"]').click(function(e) {
                    e.preventDefault();
                    that.$button.focus();
                });
            }

            this.checkDisabled();
            this.clickListener();
            if (this.options.liveSearch) this.liveSearchListener();
            this.render();
            this.liHeight();
            this.setStyle();
            this.setWidth();
            if (this.options.container) this.selectPosition();
            this.$menu.data('this', this);
            this.$newElement.data('this', this);
        },

        createDropdown: function() {
            //If we are multiple, then add the show-tick class by default
            var multiple = this.multiple ? ' show-tick' : '';
            var inputGroup = this.$element.parent().hasClass('input-group') ? ' input-group-btn' : '';
            var autofocus = this.autofocus ? ' autofocus' : '';
            var header = this.options.header ? '<div class="popover-title"><button type="button" class="close" aria-hidden="true">&times;</button>' + this.options.header + '</div>' : '';
            var searchbox = this.options.liveSearch ? '<div class="bootstrap-select-searchbox"><input type="text" class="input-block-level form-control" /></div>' : '';
            var actionsbox = this.options.actionsBox ? '<div class="bs-actionsbox">' +
                '<div class="btn-group btn-block">' +
                '<button class="actions-btn bs-select-all btn btn-sm btn-default">' +
                'Select All' +
                '</button>' +
                '<button class="actions-btn bs-deselect-all btn btn-sm btn-default">' +
                'Deselect All' +
                '</button>' +
                '</div>' +
                '</div>' : '';
            var drop =
                '<div class="btn-group bootstrap-select' + multiple + inputGroup + '">' +
                '<button type="button" class="btn dropdown-toggle selectpicker" data-toggle="dropdown"' + autofocus + '>' +
                '<span class="filter-option pull-left"></span>&nbsp;' +
                '<span class="caret"></span>' +
                '</button>' +
                '<div class="dropdown-menu open">' +
                header +
                searchbox +
                actionsbox +
                '<ul class="dropdown-menu inner selectpicker" role="menu">' +
                '</ul>' +
                '</div>' +
                '</div>';

            return $(drop);
        },

        createView: function() {
            var $drop = this.createDropdown();
            var $li = this.createLi();
            $drop.find('ul').append($li);
            return $drop;
        },

        reloadLi: function() {
            //Remove all children.
            this.destroyLi();
            //Re build
            var $li = this.createLi();
            this.$menu.find('ul').append($li);
        },

        destroyLi: function() {
            this.$menu.find('li').remove();
        },

        createLi: function() {
            var that = this,
                _liA = [],
                _liHtml = '';

            this.$element.find('option').each(function() {
                var $this = $(this);

                //Get the class and text for the option
                var optionClass = $this.attr('class') || '';
                var inline = $this.attr('style') || '';
                var text = $this.data('content') ? $this.data('content') : $this.html();
                var subtext = $this.data('subtext') !== undefined ? '<small class="muted text-muted">' + $this.data('subtext') + '</small>' : '';
                var icon = $this.data('icon') !== undefined ? '<i class="' + that.options.iconBase + ' ' + $this.data('icon') + '"></i> ' : '';
                if (icon !== '' && ($this.is(':disabled') || $this.parent().is(':disabled'))) {
                    icon = '<span>' + icon + '</span>';
                }

                if (!$this.data('content')) {
                    //Prepend any icon and append any subtext to the main text.
                    text = icon + '<span class="text">' + text + subtext + '</span>';
                }

                if (that.options.hideDisabled && ($this.is(':disabled') || $this.parent().is(':disabled'))) {
                    _liA.push('<a style="min-height: 0; padding: 0"></a>');
                } else if ($this.parent().is('optgroup') && $this.data('divider') !== true) {
                    if ($this.index() === 0) {
                        //Get the opt group label
                        var label = $this.parent().attr('label');
                        var labelSubtext = $this.parent().data('subtext') !== undefined ? '<small class="muted text-muted">' + $this.parent().data('subtext') + '</small>' : '';
                        var labelIcon = $this.parent().data('icon') ? '<i class="' + $this.parent().data('icon') + '"></i> ' : '';
                        label = labelIcon + '<span class="text">' + label + labelSubtext + '</span>';

                        if ($this[0].index !== 0) {
                            _liA.push(
                                '<div class="div-contain"><div class="divider"></div></div>' +
                                '<dt>' + label + '</dt>' +
                                that.createA(text, 'opt ' + optionClass, inline)
                            );
                        } else {
                            _liA.push(
                                '<dt>' + label + '</dt>' +
                                that.createA(text, 'opt ' + optionClass, inline));
                        }
                    } else {
                        _liA.push(that.createA(text, 'opt ' + optionClass, inline));
                    }
                } else if ($this.data('divider') === true) {
                    _liA.push('<div class="div-contain"><div class="divider"></div></div>');
                } else if ($(this).data('hidden') === true) {
                    _liA.push('<a></a>');
                } else {
                    _liA.push(that.createA(text, optionClass, inline));
                }
            });

            $.each(_liA, function(i, item) {
                var hide = item === '<a></a>' ? 'class="hide is-hidden"' : '';
                _liHtml += '<li rel="' + i + '"' + hide + '>' + item + '</li>';
            });

            //If we are not multiple, and we dont have a selected item, and we dont have a title, select the first element so something is set in the button
            if (!this.multiple && this.$element.find('option:selected').length === 0 && !this.options.title) {
                this.$element.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
            }

            return $(_liHtml);
        },

        createA: function(text, classes, inline) {
            return '<a tabindex="0" class="' + classes + '" style="' + inline + '">' +
                text +
                '<i class="' + this.options.iconBase + ' ' + this.options.tickIcon + ' icon-ok check-mark"></i>' +
                '</a>';
        },

        render: function(updateLi) {
            var that = this;

            //Update the LI to match the SELECT
            if (updateLi !== false) {
                this.$element.find('option').each(function(index) {
                    that.setDisabled(index, $(this).is(':disabled') || $(this).parent().is(':disabled'));
                    that.setSelected(index, $(this).is(':selected'));
                });
            }

            this.tabIndex();

            var selectedItems = this.$element.find('option:selected').map(function() {
                var $this = $(this);
                var icon = $this.data('icon') && that.options.showIcon ? '<i class="' + that.options.iconBase + ' ' + $this.data('icon') + '"></i> ' : '';
                var subtext;
                if (that.options.showSubtext && $this.attr('data-subtext') && !that.multiple) {
                    subtext = ' <small class="muted text-muted">' + $this.data('subtext') + '</small>';
                } else {
                    subtext = '';
                }
                if ($this.data('content') && that.options.showContent) {
                    return $this.data('content');
                } else if ($this.attr('title') !== undefined) {
                    return $this.attr('title');
                } else {
                    return icon + $this.html() + subtext;
                }
            }).toArray();

            //Fixes issue in IE10 occurring when no default option is selected and at least one option is disabled
            //Convert all the values into a comma delimited string
            var title = !this.multiple ? selectedItems[0] : selectedItems.join(this.options.multipleSeparator);

            //If this is multi select, and the selectText type is count, the show 1 of 2 selected etc..
            if (this.multiple && this.options.selectedTextFormat.indexOf('count') > -1) {
                var max = this.options.selectedTextFormat.split('>');
                var notDisabled = this.options.hideDisabled ? ':not([disabled])' : '';
                if ((max.length > 1 && selectedItems.length > max[1]) || (max.length == 1 && selectedItems.length >= 2)) {
                    title = this.options.countSelectedText.replace('{0}', selectedItems.length).replace('{1}', this.$element.find('option:not([data-divider="true"]):not([data-hidden="true"])' + notDisabled).length);
                }
            }

            this.options.title = this.$element.attr('title');

            //If we dont have a title, then use the default, or if nothing is set at all, use the not selected text
            if (!title) {
                title = this.options.title !== undefined ? this.options.title : this.options.noneSelectedText;
            }

            this.$button.attr('title', $.trim(title));
            this.$newElement.find('.filter-option').html(title);
        },

        setStyle: function(style, status) {
            if (this.$element.attr('class')) {
                this.$newElement.addClass(this.$element.attr('class').replace(/selectpicker|mobile-device/gi, ''));
            }

            var buttonClass = style ? style : this.options.style;

            if (status == 'add') {
                this.$button.addClass(buttonClass);
            } else if (status == 'remove') {
                this.$button.removeClass(buttonClass);
            } else {
                this.$button.removeClass(this.options.style);
                this.$button.addClass(buttonClass);
            }
        },

        liHeight: function() {
            if (this.options.size === false) return;

            var $selectClone = this.$menu.parent().clone().find('> .dropdown-toggle').prop('autofocus', false).end().appendTo('body'),
                $menuClone = $selectClone.addClass('open').find('> .dropdown-menu'),
                liHeight = $menuClone.find('li > a').outerHeight(),
                headerHeight = this.options.header ? $menuClone.find('.popover-title').outerHeight() : 0,
                searchHeight = this.options.liveSearch ? $menuClone.find('.bootstrap-select-searchbox').outerHeight() : 0,
                actionsHeight = this.options.actionsBox ? $menuClone.find('.bs-actionsbox').outerHeight() : 0;

            $selectClone.remove();

            this.$newElement
                .data('liHeight', liHeight)
                .data('headerHeight', headerHeight)
                .data('searchHeight', searchHeight)
                .data('actionsHeight', actionsHeight);
        },

        setSize: function() {
            var that = this,
                menu = this.$menu,
                menuInner = menu.find('.inner'),
                selectHeight = this.$newElement.outerHeight(),
                liHeight = this.$newElement.data('liHeight'),
                headerHeight = this.$newElement.data('headerHeight'),
                searchHeight = this.$newElement.data('searchHeight'),
                actionsHeight = this.$newElement.data('actionsHeight'),
                divHeight = menu.find('li .divider').outerHeight(true),
                menuPadding = parseInt(menu.css('padding-top')) +
                    parseInt(menu.css('padding-bottom')) +
                    parseInt(menu.css('border-top-width')) +
                    parseInt(menu.css('border-bottom-width')),
                notDisabled = this.options.hideDisabled ? ':not(.disabled)' : '',
                $window = $(window),
                menuExtras = menuPadding + parseInt(menu.css('margin-top')) + parseInt(menu.css('margin-bottom')) + 2,
                menuHeight,
                selectOffsetTop,
                selectOffsetBot,
                posVert = function() {
                    selectOffsetTop = that.$newElement.offset().top - $window.scrollTop();
                    selectOffsetBot = $window.height() - selectOffsetTop - selectHeight;
                };
            posVert();
            if (this.options.header) menu.css('padding-top', 0);

            if (this.options.size == 'auto') {
                var getSize = function() {
                    var minHeight,
                        lisVis = that.$lis.not('.hide');

                    posVert();
                    menuHeight = selectOffsetBot - menuExtras;

                    if (that.options.dropupAuto) {
                        that.$newElement.toggleClass('dropup', (selectOffsetTop > selectOffsetBot) && ((menuHeight - menuExtras) < menu.height()));
                    }
                    if (that.$newElement.hasClass('dropup')) {
                        menuHeight = selectOffsetTop - menuExtras;
                    }

                    if ((lisVis.length + lisVis.find('dt').length) > 3) {
                        minHeight = liHeight * 3 + menuExtras - 2;
                    } else {
                        minHeight = 0;
                    }

                    menu.css({
                        'max-height': menuHeight + 'px',
                        'overflow': 'hidden',
                        'min-height': minHeight + headerHeight + searchHeight + actionsHeight + 'px'
                    });
                    menuInner.css({
                        'max-height': menuHeight - headerHeight - searchHeight - actionsHeight - menuPadding + 'px',
                        'overflow-y': 'auto',
                        'min-height': Math.max(minHeight - menuPadding, 0) + 'px'
                    });
                };
                getSize();
                this.$searchbox.off('input.getSize propertychange.getSize').on('input.getSize propertychange.getSize', getSize);
                $(window).off('resize.getSize').on('resize.getSize', getSize);
                $(window).off('scroll.getSize').on('scroll.getSize', getSize);
            } else if (this.options.size && this.options.size != 'auto' && menu.find('li' + notDisabled).length > this.options.size) {
                var optIndex = menu.find('li' + notDisabled + ' > *').filter(':not(.div-contain)').slice(0, this.options.size).last().parent().index();
                var divLength = menu.find('li').slice(0, optIndex + 1).find('.div-contain').length;
                menuHeight = liHeight * this.options.size + divLength * divHeight + menuPadding;
                if (that.options.dropupAuto) {
                    this.$newElement.toggleClass('dropup', (selectOffsetTop > selectOffsetBot) && (menuHeight < menu.height()));
                }
                menu.css({
                    'max-height': menuHeight + headerHeight + searchHeight + actionsHeight + 'px',
                    'overflow': 'hidden'
                });
                menuInner.css({
                    'max-height': menuHeight - menuPadding + 'px',
                    'overflow-y': 'auto'
                });
            }
        },

        setWidth: function() {
            if (this.options.width == 'auto') {
                this.$menu.css('min-width', '0');

                // Get correct width if element hidden
                var selectClone = this.$newElement.clone().appendTo('body');
                var ulWidth = selectClone.find('> .dropdown-menu').css('width');
                var btnWidth = selectClone.css('width', 'auto').find('> button').css('width');
                selectClone.remove();

                // Set width to whatever's larger, button title or longest option
                this.$newElement.css('width', Math.max(parseInt(ulWidth), parseInt(btnWidth)) + 'px');
            } else if (this.options.width == 'fit') {
                // Remove inline min-width so width can be changed from 'auto'
                this.$menu.css('min-width', '');
                this.$newElement.css('width', '').addClass('fit-width');
            } else if (this.options.width) {
                // Remove inline min-width so width can be changed from 'auto'
                this.$menu.css('min-width', '');
                this.$newElement.css('width', this.options.width);
            } else {
                // Remove inline min-width/width so width can be changed
                this.$menu.css('min-width', '');
                this.$newElement.css('width', '');
            }
            // Remove fit-width class if width is changed programmatically
            if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
                this.$newElement.removeClass('fit-width');
            }
        },

        selectPosition: function() {
            var that = this,
                drop = '<div />',
                $drop = $(drop),
                pos,
                actualHeight,
                getPlacement = function($element) {
                    $drop.addClass($element.attr('class').replace(/form-control/gi, '')).toggleClass('dropup', $element.hasClass('dropup'));
                    pos = $element.offset();
                    actualHeight = $element.hasClass('dropup') ? 0 : $element[0].offsetHeight;
                    $drop.css({
                        'top': pos.top + actualHeight,
                        'left': pos.left,
                        'width': $element[0].offsetWidth,
                        'position': 'absolute'
                    });
                };
            this.$newElement.on('click', function() {
                if (that.isDisabled()) {
                    return;
                }
                getPlacement($(this));
                $drop.appendTo(that.options.container);
                $drop.toggleClass('open', !$(this).hasClass('open'));
                $drop.append(that.$menu);
            });
            $(window).resize(function() {
                getPlacement(that.$newElement);
            });
            $(window).on('scroll', function() {
                getPlacement(that.$newElement);
            });
            $('html').on('click', function(e) {
                if ($(e.target).closest(that.$newElement).length < 1) {
                    $drop.removeClass('open');
                }
            });
        },

        mobile: function() {
            this.$element.addClass('mobile-device').appendTo(this.$newElement);
            if (this.options.container) this.$menu.hide();
        },

        refresh: function() {
            this.$lis = null;
            this.reloadLi();
            this.render();
            this.setWidth();
            this.setStyle();
            this.checkDisabled();
            this.liHeight();
        },

        update: function() {
            this.reloadLi();
            this.setWidth();
            this.setStyle();
            this.checkDisabled();
            this.liHeight();
        },

        setSelected: function(index, selected) {
            if (this.$lis == null) this.$lis = this.$menu.find('li');
            $(this.$lis[index]).toggleClass('selected', selected);
        },

        setDisabled: function(index, disabled) {
            if (this.$lis == null) this.$lis = this.$menu.find('li');
            if (disabled) {
                $(this.$lis[index]).addClass('disabled').find('a').attr('href', '#').attr('tabindex', -1);
            } else {
                $(this.$lis[index]).removeClass('disabled').find('a').removeAttr('href').attr('tabindex', 0);
            }
        },

        isDisabled: function() {
            return this.$element.is(':disabled');
        },

        checkDisabled: function() {
            var that = this;

            if (this.isDisabled()) {
                this.$button.addClass('disabled').attr('tabindex', -1);
            } else {
                if (this.$button.hasClass('disabled')) {
                    this.$button.removeClass('disabled');
                }

                if (this.$button.attr('tabindex') == -1) {
                    if (!this.$element.data('tabindex')) this.$button.removeAttr('tabindex');
                }
            }

            this.$button.click(function() {
                return !that.isDisabled();
            });
        },

        tabIndex: function() {
            if (this.$element.is('[tabindex]')) {
                this.$element.data('tabindex', this.$element.attr('tabindex'));
                this.$button.attr('tabindex', this.$element.data('tabindex'));
            }
        },

        clickListener: function() {
            var that = this;

            $('body').on('touchstart.dropdown', '.dropdown-menu', function(e) {
                e.stopPropagation();
            });

            this.$newElement.on('click', function() {
                that.setSize();
                if (!that.options.liveSearch && !that.multiple) {
                    setTimeout(function() {
                        that.$menu.find('.selected a').focus();
                    }, 10);
                }
            });

            this.$menu.on('click', 'li a', function(e) {
                var clickedIndex = $(this).parent().index(),
                    prevValue = that.$element.val(),
                    prevIndex = that.$element.prop('selectedIndex');

                //Dont close on multi choice menu
                if (that.multiple) {
                    e.stopPropagation();
                }

                e.preventDefault();

                //Dont run if we have been disabled
                if (!that.isDisabled() && !$(this).parent().hasClass('disabled')) {
                    var $options = that.$element.find('option'),
                        $option = $options.eq(clickedIndex),
                        state = $option.prop('selected'),
                        $optgroup = $option.parent('optgroup'),
                        maxOptions = that.options.maxOptions,
                        maxOptionsGrp = $optgroup.data('maxOptions') || false;

                    //Deselect all others if not multi select box
                    if (!that.multiple) {
                        $options.prop('selected', false);
                        $option.prop('selected', true);
                        that.$menu.find('.selected').removeClass('selected');
                        that.setSelected(clickedIndex, true);
                    }
                    //Else toggle the one we have chosen if we are multi select.
                    else {
                        $option.prop('selected', !state);
                        that.setSelected(clickedIndex, !state);

                        if ((maxOptions !== false) || (maxOptionsGrp !== false)) {
                            var maxReached = maxOptions < $options.filter(':selected').length,
                                maxReachedGrp = maxOptionsGrp < $optgroup.find('option:selected').length,
                                maxOptionsArr = that.options.maxOptionsText,
                                maxTxt = maxOptionsArr[0].replace('{n}', maxOptions),
                                maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp),
                                $notify = $('<div class="notify"></div>');

                            if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                                // If {var} is set in array, replace it
                                if (maxOptionsArr[2]) {
                                    maxTxt = maxTxt.replace('{var}', maxOptionsArr[2][maxOptions > 1 ? 0 : 1]);
                                    maxTxtGrp = maxTxtGrp.replace('{var}', maxOptionsArr[2][maxOptionsGrp > 1 ? 0 : 1]);
                                }

                                $option.prop('selected', false);

                                that.$menu.append($notify);

                                if (maxOptions && maxReached) {
                                    $notify.append($('<div>' + maxTxt + '</div>'));
                                    that.$element.trigger('maxReached.bs.select');
                                }

                                if (maxOptionsGrp && maxReachedGrp) {
                                    $notify.append($('<div>' + maxTxtGrp + '</div>'));
                                    that.$element.trigger('maxReachedGrp.bs.select');
                                }

                                setTimeout(function() {
                                    that.setSelected(clickedIndex, false);
                                }, 10);

                                $notify.delay(750).fadeOut(300, function() {
                                    $(this).remove();
                                });
                            }
                        }
                    }

                    if (!that.multiple) {
                        that.$button.focus();
                    } else if (that.options.liveSearch) {
                        that.$searchbox.focus();
                    }

                    // Trigger select 'change'
                    if ((prevValue != that.$element.val() && that.multiple) || (prevIndex != that.$element.prop('selectedIndex') && !that.multiple)) {
                        that.$element.change();
                    }
                }
            });

            this.$menu.on('click', 'li.disabled a, li dt, li .div-contain, .popover-title, .popover-title :not(.close)', function(e) {
                if (e.target == this) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!that.options.liveSearch) {
                        that.$button.focus();
                    } else {
                        that.$searchbox.focus();
                    }
                }
            });

            this.$menu.on('click', '.popover-title .close', function() {
                that.$button.focus();
            });

            this.$searchbox.on('click', function(e) {
                e.stopPropagation();
            });


            this.$menu.on('click', '.actions-btn', function(e) {
                if (that.options.liveSearch) {
                    that.$searchbox.focus();
                } else {
                    that.$button.focus();
                }

                e.preventDefault();
                e.stopPropagation();

                if ($(this).is('.bs-select-all')) {
                    that.selectAll();
                } else {
                    that.deselectAll();
                }
                that.$element.change();
            });

            this.$element.change(function() {
                that.render(false);
            });
        },

        liveSearchListener: function() {
            var that = this,
                no_results = $('<li class="no-results"></li>');

            this.$newElement.on('click.dropdown.data-api', function() {
                that.$menu.find('.active').removeClass('active');
                if ( !! that.$searchbox.val()) {
                    that.$searchbox.val('');
                    that.$lis.not('.is-hidden').removeClass('hide');
                    if ( !! no_results.parent().length) no_results.remove();
                }
                if (!that.multiple) that.$menu.find('.selected').addClass('active');
                setTimeout(function() {
                    that.$searchbox.focus();
                }, 10);
            });

            this.$searchbox.on('input propertychange', function() {
                if (that.$searchbox.val()) {
                    that.$lis.not('.is-hidden').removeClass('hide').find('a').not(':icontains(' + that.$searchbox.val() + ')').parent().addClass('hide');

                    if (!that.$menu.find('li').filter(':visible:not(.no-results)').length) {
                        if ( !! no_results.parent().length) no_results.remove();
                        no_results.html(that.options.noneResultsText + ' "' + that.$searchbox.val() + '"').show();
                        that.$menu.find('li').last().after(no_results);
                    } else if ( !! no_results.parent().length) {
                        no_results.remove();
                    }

                } else {
                    that.$lis.not('.is-hidden').removeClass('hide');
                    if ( !! no_results.parent().length) no_results.remove();
                }

                that.$menu.find('li.active').removeClass('active');
                that.$menu.find('li').filter(':visible:not(.divider)').eq(0).addClass('active').find('a').focus();
                $(this).focus();
            });

            this.$menu.on('mouseenter', 'a', function(e) {
                that.$menu.find('.active').removeClass('active');
                $(e.currentTarget).parent().not('.disabled').addClass('active');
            });

            this.$menu.on('mouseleave', 'a', function() {
                that.$menu.find('.active').removeClass('active');
            });
        },

        val: function(value) {

            if (value !== undefined) {
                this.$element.val(value);

                this.$element.change();
                return this.$element;
            } else {
                return this.$element.val();
            }
        },

        selectAll: function() {
            if (this.$lis == null) this.$lis = this.$menu.find('li');
            this.$element.find('option:enabled').prop('selected', true);
            $(this.$lis).filter(':not(.disabled)').addClass('selected');
            this.render(false);
        },

        deselectAll: function() {
            if (this.$lis == null) this.$lis = this.$menu.find('li');
            this.$element.find('option:enabled').prop('selected', false);
            $(this.$lis).filter(':not(.disabled)').removeClass('selected');
            this.render(false);
        },

        keydown: function(e) {
            var $this,
                $items,
                $parent,
                index,
                next,
                first,
                last,
                prev,
                nextPrev,
                that,
                prevIndex,
                isActive,
                keyCodeMap = {
                    32: ' ',
                    48: '0',
                    49: '1',
                    50: '2',
                    51: '3',
                    52: '4',
                    53: '5',
                    54: '6',
                    55: '7',
                    56: '8',
                    57: '9',
                    59: ';',
                    65: 'a',
                    66: 'b',
                    67: 'c',
                    68: 'd',
                    69: 'e',
                    70: 'f',
                    71: 'g',
                    72: 'h',
                    73: 'i',
                    74: 'j',
                    75: 'k',
                    76: 'l',
                    77: 'm',
                    78: 'n',
                    79: 'o',
                    80: 'p',
                    81: 'q',
                    82: 'r',
                    83: 's',
                    84: 't',
                    85: 'u',
                    86: 'v',
                    87: 'w',
                    88: 'x',
                    89: 'y',
                    90: 'z',
                    96: '0',
                    97: '1',
                    98: '2',
                    99: '3',
                    100: '4',
                    101: '5',
                    102: '6',
                    103: '7',
                    104: '8',
                    105: '9'
                };

            $this = $(this);

            $parent = $this.parent();

            if ($this.is('input')) $parent = $this.parent().parent();

            that = $parent.data('this');

            if (that.options.liveSearch) $parent = $this.parent().parent();

            if (that.options.container) $parent = that.$menu;

            $items = $('[role=menu] li:not(.divider) a', $parent);

            isActive = that.$menu.parent().hasClass('open');

            if (!isActive && /([0-9]|[A-z])/.test(String.fromCharCode(e.keyCode))) {
                if (!that.options.container) {
                    that.setSize();
                    that.$menu.parent().addClass('open');
                    isActive = that.$menu.parent().hasClass('open');
                } else {
                    that.$newElement.trigger('click');
                }
                that.$searchbox.focus();
            }

            if (that.options.liveSearch) {
                if (/(^9$|27)/.test(e.keyCode) && isActive && that.$menu.find('.active').length === 0) {
                    e.preventDefault();
                    that.$menu.parent().removeClass('open');
                    that.$button.focus();
                }
                $items = $('[role=menu] li:not(.divider):visible', $parent);
                if (!$this.val() && !/(38|40)/.test(e.keyCode)) {
                    if ($items.filter('.active').length === 0) {
                        $items = that.$newElement.find('li').filter(':icontains(' + keyCodeMap[e.keyCode] + ')');
                    }
                }
            }

            if (!$items.length) return;

            if (/(38|40)/.test(e.keyCode)) {

                index = $items.index($items.filter(':focus'));
                first = $items.parent(':not(.disabled):visible').first().index();
                last = $items.parent(':not(.disabled):visible').last().index();
                next = $items.eq(index).parent().nextAll(':not(.disabled):visible').eq(0).index();
                prev = $items.eq(index).parent().prevAll(':not(.disabled):visible').eq(0).index();
                nextPrev = $items.eq(next).parent().prevAll(':not(.disabled):visible').eq(0).index();

                if (that.options.liveSearch) {
                    $items.each(function(i) {
                        if ($(this).is(':not(.disabled)')) {
                            $(this).data('index', i);
                        }
                    });
                    index = $items.index($items.filter('.active'));
                    first = $items.filter(':not(.disabled):visible').first().data('index');
                    last = $items.filter(':not(.disabled):visible').last().data('index');
                    next = $items.eq(index).nextAll(':not(.disabled):visible').eq(0).data('index');
                    prev = $items.eq(index).prevAll(':not(.disabled):visible').eq(0).data('index');
                    nextPrev = $items.eq(next).prevAll(':not(.disabled):visible').eq(0).data('index');
                }

                prevIndex = $this.data('prevIndex');

                if (e.keyCode == 38) {
                    if (that.options.liveSearch) index -= 1;
                    if (index != nextPrev && index > prev) index = prev;
                    if (index < first) index = first;
                    if (index == prevIndex) index = last;
                }

                if (e.keyCode == 40) {
                    if (that.options.liveSearch) index += 1;
                    if (index == -1) index = 0;
                    if (index != nextPrev && index < next) index = next;
                    if (index > last) index = last;
                    if (index == prevIndex) index = first;
                }

                $this.data('prevIndex', index);

                if (!that.options.liveSearch) {
                    $items.eq(index).focus();
                } else {
                    e.preventDefault();
                    if (!$this.is('.dropdown-toggle')) {
                        $items.removeClass('active');
                        $items.eq(index).addClass('active').find('a').focus();
                        $this.focus();
                    }
                }

            } else if (!$this.is('input')) {

                var keyIndex = [],
                    count,
                    prevKey;

                $items.each(function() {
                    if ($(this).parent().is(':not(.disabled)')) {
                        if ($.trim($(this).text().toLowerCase()).substring(0, 1) == keyCodeMap[e.keyCode]) {
                            keyIndex.push($(this).parent().index());
                        }
                    }
                });

                count = $(document).data('keycount');
                count++;
                $(document).data('keycount', count);

                prevKey = $.trim($(':focus').text().toLowerCase()).substring(0, 1);

                if (prevKey != keyCodeMap[e.keyCode]) {
                    count = 1;
                    $(document).data('keycount', count);
                } else if (count >= keyIndex.length) {
                    $(document).data('keycount', 0);
                    if (count > keyIndex.length) count = 1;
                }

                $items.eq(keyIndex[count - 1]).focus();
            }

            // Select focused option if "Enter", "Spacebar", "Tab" are pressed inside the menu.
            if (/(13|32|^9$)/.test(e.keyCode) && isActive) {
                if (!/(32)/.test(e.keyCode)) e.preventDefault();
                if (!that.options.liveSearch) {
                    $(':focus').click();
                } else if (!/(32)/.test(e.keyCode)) {
                    that.$menu.find('.active a').click();
                    $this.focus();
                }
                $(document).data('keycount', 0);
            }

            if ((/(^9$|27)/.test(e.keyCode) && isActive && (that.multiple || that.options.liveSearch)) || (/(27)/.test(e.keyCode) && !isActive)) {
                that.$menu.parent().removeClass('open');
                that.$button.focus();
            }

        },

        hide: function() {
            this.$newElement.hide();
        },

        show: function() {
            this.$newElement.show();
        },

        destroy: function() {
            this.$newElement.remove();
            this.$element.remove();
        }
    };

    $.fn.selectpicker = function(option, event) {
        //get the args of the outer function..
        var args = arguments;
        var value;
        var chain = this.each(function() {
            if ($(this).is('select')) {
                var $this = $(this),
                    data = $this.data('selectpicker'),
                    options = typeof option == 'object' && option;

                if (!data) {
                    $this.data('selectpicker', (data = new Selectpicker(this, options, event)));
                } else if (options) {
                    for (var i in options) {
                        data.options[i] = options[i];
                    }
                }

                if (typeof option == 'string') {
                    //Copy the value of option, as once we shift the arguments
                    //it also shifts the value of option.
                    var property = option;
                    if (data[property] instanceof Function) {
                        [].shift.apply(args);
                        value = data[property].apply(data, args);
                    } else {
                        value = data.options[property];
                    }
                }
            }
        });

        if (value !== undefined) {
            return value;
        } else {
            return chain;
        }
    };

    $.fn.selectpicker.defaults = {
        style: 'btn-default',
        size: 'auto',
        title: null,
        selectedTextFormat: 'values',
        noneSelectedText: 'Nothing selected',
        noneResultsText: 'No results match',
        countSelectedText: '{0} of {1} selected',
        maxOptionsText: ['Limit reached ({n} {var} max)', 'Group limit reached ({n} {var} max)', ['items', 'item']],
        width: false,
        container: false,
        hideDisabled: false,
        showSubtext: false,
        showIcon: true,
        showContent: true,
        dropupAuto: true,
        header: false,
        liveSearch: false,
        actionsBox: false,
        multipleSeparator: ', ',
        iconBase: 'glyphicon',
        tickIcon: 'glyphicon-ok',
        maxOptions: false
    };

    $(document)
        .data('keycount', 0)
        .on('keydown', '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role=menu], .bootstrap-select-searchbox input', Selectpicker.prototype.keydown)
        .on('focusin.modal', '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role=menu], .bootstrap-select-searchbox input', function(e) {
            e.stopPropagation();
        });

}(window.jQuery);;/*!
 * Timepicker Component for Twitter Bootstrap
 *
 * Copyright 2013 Joris de Wit
 *
 * Contributors https://github.com/jdewit/bootstrap-timepicker/graphs/contributors
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function($, window, document, undefined) {
    'use strict';

    // TIMEPICKER PUBLIC CLASS DEFINITION
    var Timepicker = function(element, options) {
        this.widget = '';
        this.$element = $(element);
        this.defaultTime = options.defaultTime;
        this.disableFocus = options.disableFocus;
        this.disableMousewheel = options.disableMousewheel;
        this.isOpen = options.isOpen;
        this.minuteStep = options.minuteStep;
        this.modalBackdrop = options.modalBackdrop;
        this.orientation = options.orientation;
        this.secondStep = options.secondStep;
        this.showInputs = options.showInputs;
        this.showMeridian = options.showMeridian;
        this.showSeconds = options.showSeconds;
        this.template = options.template;
        this.appendWidgetTo = options.appendWidgetTo;
        this.showWidgetOnAddonClick = options.showWidgetOnAddonClick;

        this._init();
    };

    Timepicker.prototype = {

        constructor: Timepicker,
        _init: function() {
            var self = this;

            if (this.showWidgetOnAddonClick && (this.$element.parent().hasClass('input-append') || this.$element.parent().hasClass('input-prepend'))) {
                this.$element.parent('.input-append, .input-prepend').find('.add-on').on({
                    'click.timepicker': $.proxy(this.showWidget, this)
                });
                this.$element.on({
                    'focus.timepicker': $.proxy(this.highlightUnit, this),
                    'click.timepicker': $.proxy(this.highlightUnit, this),
                    'keydown.timepicker': $.proxy(this.elementKeydown, this),
                    'blur.timepicker': $.proxy(this.blurElement, this),
                    'mousewheel.timepicker DOMMouseScroll.timepicker': $.proxy(this.mousewheel, this)
                });
            } else {
                if (this.template) {
                    this.$element.on({
                        'focus.timepicker': $.proxy(this.showWidget, this),
                        'click.timepicker': $.proxy(this.showWidget, this),
                        'blur.timepicker': $.proxy(this.blurElement, this),
                        'mousewheel.timepicker DOMMouseScroll.timepicker': $.proxy(this.mousewheel, this)
                    });
                } else {
                    this.$element.on({
                        'focus.timepicker': $.proxy(this.highlightUnit, this),
                        'click.timepicker': $.proxy(this.highlightUnit, this),
                        'keydown.timepicker': $.proxy(this.elementKeydown, this),
                        'blur.timepicker': $.proxy(this.blurElement, this),
                        'mousewheel.timepicker DOMMouseScroll.timepicker': $.proxy(this.mousewheel, this)
                    });
                }
            }

            if (this.template !== false) {
                this.$widget = $(this.getTemplate()).on('click', $.proxy(this.widgetClick, this));
            } else {
                this.$widget = false;
            }

            if (this.showInputs && this.$widget !== false) {
                this.$widget.find('input').each(function() {
                    $(this).on({
                        'click.timepicker': function() {
                            $(this).select();
                        },
                        'keydown.timepicker': $.proxy(self.widgetKeydown, self),
                        'keyup.timepicker': $.proxy(self.widgetKeyup, self)
                    });
                });
            }

            this.setDefaultTime(this.defaultTime);
        },

        blurElement: function() {
            this.highlightedUnit = null;
            this.updateFromElementVal();
        },

        clear: function() {
            this.hour = '';
            this.minute = '';
            this.second = '';
            this.meridian = '';

            this.$element.val('');
        },

        decrementHour: function() {
            if (this.showMeridian) {
                if (this.hour === 1) {
                    this.hour = 12;
                } else if (this.hour === 12) {
                    this.hour--;

                    return this.toggleMeridian();
                } else if (this.hour === 0) {
                    this.hour = 11;

                    return this.toggleMeridian();
                } else {
                    this.hour--;
                }
            } else {
                if (this.hour <= 0) {
                    this.hour = 23;
                } else {
                    this.hour--;
                }
            }
        },

        decrementMinute: function(step) {
            var newVal;

            if (step) {
                newVal = this.minute - step;
            } else {
                newVal = this.minute - this.minuteStep;
            }

            if (newVal < 0) {
                this.decrementHour();
                this.minute = newVal + 60;
            } else {
                this.minute = newVal;
            }
        },

        decrementSecond: function() {
            var newVal = this.second - this.secondStep;

            if (newVal < 0) {
                this.decrementMinute(true);
                this.second = newVal + 60;
            } else {
                this.second = newVal;
            }
        },

        elementKeydown: function(e) {
            switch (e.keyCode) {
                case 9: //tab
                case 27: // escape
                    this.updateFromElementVal();
                    break;
                case 37: // left arrow
                    e.preventDefault();
                    this.highlightPrevUnit();
                    break;
                case 38: // up arrow
                    e.preventDefault();
                    switch (this.highlightedUnit) {
                        case 'hour':
                            this.incrementHour();
                            this.highlightHour();
                            break;
                        case 'minute':
                            this.incrementMinute();
                            this.highlightMinute();
                            break;
                        case 'second':
                            this.incrementSecond();
                            this.highlightSecond();
                            break;
                        case 'meridian':
                            this.toggleMeridian();
                            this.highlightMeridian();
                            break;
                    }
                    this.update();
                    break;
                case 39: // right arrow
                    e.preventDefault();
                    this.highlightNextUnit();
                    break;
                case 40: // down arrow
                    e.preventDefault();
                    switch (this.highlightedUnit) {
                        case 'hour':
                            this.decrementHour();
                            this.highlightHour();
                            break;
                        case 'minute':
                            this.decrementMinute();
                            this.highlightMinute();
                            break;
                        case 'second':
                            this.decrementSecond();
                            this.highlightSecond();
                            break;
                        case 'meridian':
                            this.toggleMeridian();
                            this.highlightMeridian();
                            break;
                    }

                    this.update();
                    break;
            }
        },

        getCursorPosition: function() {
            var input = this.$element.get(0);

            if ('selectionStart' in input) { // Standard-compliant browsers

                return input.selectionStart;
            } else if (document.selection) { // IE fix
                input.focus();
                var sel = document.selection.createRange(),
                    selLen = document.selection.createRange().text.length;

                sel.moveStart('character', -input.value.length);

                return sel.text.length - selLen;
            }
        },

        getTemplate: function() {
            var template,
                hourTemplate,
                minuteTemplate,
                secondTemplate,
                meridianTemplate,
                templateContent;

            if (this.showInputs) {
                hourTemplate = '<input type="text" class="bootstrap-timepicker-hour" maxlength="2"/>';
                minuteTemplate = '<input type="text" class="bootstrap-timepicker-minute" maxlength="2"/>';
                secondTemplate = '<input type="text" class="bootstrap-timepicker-second" maxlength="2"/>';
                meridianTemplate = '<input type="text" class="bootstrap-timepicker-meridian" maxlength="2"/>';
            } else {
                hourTemplate = '<span class="bootstrap-timepicker-hour"></span>';
                minuteTemplate = '<span class="bootstrap-timepicker-minute"></span>';
                secondTemplate = '<span class="bootstrap-timepicker-second"></span>';
                meridianTemplate = '<span class="bootstrap-timepicker-meridian"></span>';
            }

            templateContent = '<table>' +
                '<tr>' +
                '<td><a href="#" data-action="incrementHour"><i class="fa fa-angle-up"></i></a></td>' +
                '<td class="separator">&nbsp;</td>' +
                '<td><a href="#" data-action="incrementMinute"><i class="fa fa-angle-up"></i></a></td>' +
                (this.showSeconds ?
                '<td class="separator">&nbsp;</td>' +
                '<td><a href="#" data-action="incrementSecond"><i class="fa fa-angle-up"></i></a></td>' : '') +
                (this.showMeridian ?
                '<td class="separator">&nbsp;</td>' +
                '<td class="meridian-column"><a href="#" data-action="toggleMeridian"><i class="fa fa-angle-up"></i></a></td>' : '') +
                '</tr>' +
                '<tr>' +
                '<td>' + hourTemplate + '</td> ' +
                '<td class="separator">:</td>' +
                '<td>' + minuteTemplate + '</td> ' +
                (this.showSeconds ?
                '<td class="separator">:</td>' +
                '<td>' + secondTemplate + '</td>' : '') +
                (this.showMeridian ?
                '<td class="separator">&nbsp;</td>' +
                '<td>' + meridianTemplate + '</td>' : '') +
                '</tr>' +
                '<tr>' +
                '<td><a href="#" data-action="decrementHour"><i class="fa fa-angle-down"></i></a></td>' +
                '<td class="separator"></td>' +
                '<td><a href="#" data-action="decrementMinute"><i class="fa fa-angle-down"></i></a></td>' +
                (this.showSeconds ?
                '<td class="separator">&nbsp;</td>' +
                '<td><a href="#" data-action="decrementSecond"><i class="fa fa-angle-down"></i></a></td>' : '') +
                (this.showMeridian ?
                '<td class="separator">&nbsp;</td>' +
                '<td><a href="#" data-action="toggleMeridian"><i class="fa fa-angle-down"></i></a></td>' : '') +
                '</tr>' +
                '</table>';

            switch (this.template) {
                case 'modal':
                    template = '<div class="bootstrap-timepicker-widget modal hide fade in" data-backdrop="' + (this.modalBackdrop ? 'true' : 'false') + '">' +
                        '<div class="modal-header">' +
                        '<a href="#" class="close" data-dismiss="modal">×</a>' +
                        '<h3>Pick a Time</h3>' +
                        '</div>' +
                        '<div class="modal-content">' +
                        templateContent +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '<a href="#" class="btn btn-primary" data-dismiss="modal">OK</a>' +
                        '</div>' +
                        '</div>';
                    break;
                case 'dropdown':
                    template = '<div class="bootstrap-timepicker-widget dropdown-menu">' + templateContent + '</div>';
                    break;
            }

            return template;
        },

        getTime: function() {
            if (this.hour === '') {
                return '';
            }

            return this.hour + ':' + (this.minute.toString().length === 1 ? '0' + this.minute : this.minute) + (this.showSeconds ? ':' + (this.second.toString().length === 1 ? '0' + this.second : this.second) : '') + (this.showMeridian ? ' ' + this.meridian : '');
        },

        hideWidget: function() {
            if (this.isOpen === false) {
                return;
            }

            this.$element.trigger({
                'type': 'hide.timepicker',
                'time': {
                    'value': this.getTime(),
                    'hours': this.hour,
                    'minutes': this.minute,
                    'seconds': this.second,
                    'meridian': this.meridian
                }
            });

            if (this.template === 'modal' && this.$widget.modal) {
                this.$widget.modal('hide');
            } else {
                this.$widget.removeClass('open');
            }

            $(document).off('mousedown.timepicker, touchend.timepicker');

            this.isOpen = false;
            // show/hide approach taken by datepicker
            this.$widget.detach();
        },

        highlightUnit: function() {
            this.position = this.getCursorPosition();
            if (this.position >= 0 && this.position <= 2) {
                this.highlightHour();
            } else if (this.position >= 3 && this.position <= 5) {
                this.highlightMinute();
            } else if (this.position >= 6 && this.position <= 8) {
                if (this.showSeconds) {
                    this.highlightSecond();
                } else {
                    this.highlightMeridian();
                }
            } else if (this.position >= 9 && this.position <= 11) {
                this.highlightMeridian();
            }
        },

        highlightNextUnit: function() {
            switch (this.highlightedUnit) {
                case 'hour':
                    this.highlightMinute();
                    break;
                case 'minute':
                    if (this.showSeconds) {
                        this.highlightSecond();
                    } else if (this.showMeridian) {
                        this.highlightMeridian();
                    } else {
                        this.highlightHour();
                    }
                    break;
                case 'second':
                    if (this.showMeridian) {
                        this.highlightMeridian();
                    } else {
                        this.highlightHour();
                    }
                    break;
                case 'meridian':
                    this.highlightHour();
                    break;
            }
        },

        highlightPrevUnit: function() {
            switch (this.highlightedUnit) {
                case 'hour':
                    if (this.showMeridian) {
                        this.highlightMeridian();
                    } else if (this.showSeconds) {
                        this.highlightSecond();
                    } else {
                        this.highlightMinute();
                    }
                    break;
                case 'minute':
                    this.highlightHour();
                    break;
                case 'second':
                    this.highlightMinute();
                    break;
                case 'meridian':
                    if (this.showSeconds) {
                        this.highlightSecond();
                    } else {
                        this.highlightMinute();
                    }
                    break;
            }
        },

        highlightHour: function() {
            var $element = this.$element.get(0),
                self = this;

            this.highlightedUnit = 'hour';

            if ($element.setSelectionRange) {
                setTimeout(function() {
                    if (self.hour < 10) {
                        $element.setSelectionRange(0, 1);
                    } else {
                        $element.setSelectionRange(0, 2);
                    }
                }, 0);
            }
        },

        highlightMinute: function() {
            var $element = this.$element.get(0),
                self = this;

            this.highlightedUnit = 'minute';

            if ($element.setSelectionRange) {
                setTimeout(function() {
                    if (self.hour < 10) {
                        $element.setSelectionRange(2, 4);
                    } else {
                        $element.setSelectionRange(3, 5);
                    }
                }, 0);
            }
        },

        highlightSecond: function() {
            var $element = this.$element.get(0),
                self = this;

            this.highlightedUnit = 'second';

            if ($element.setSelectionRange) {
                setTimeout(function() {
                    if (self.hour < 10) {
                        $element.setSelectionRange(5, 7);
                    } else {
                        $element.setSelectionRange(6, 8);
                    }
                }, 0);
            }
        },

        highlightMeridian: function() {
            var $element = this.$element.get(0),
                self = this;

            this.highlightedUnit = 'meridian';

            if ($element.setSelectionRange) {
                if (this.showSeconds) {
                    setTimeout(function() {
                        if (self.hour < 10) {
                            $element.setSelectionRange(8, 10);
                        } else {
                            $element.setSelectionRange(9, 11);
                        }
                    }, 0);
                } else {
                    setTimeout(function() {
                        if (self.hour < 10) {
                            $element.setSelectionRange(5, 7);
                        } else {
                            $element.setSelectionRange(6, 8);
                        }
                    }, 0);
                }
            }
        },

        incrementHour: function() {
            if (this.showMeridian) {
                if (this.hour === 11) {
                    this.hour++;
                    return this.toggleMeridian();
                } else if (this.hour === 12) {
                    this.hour = 0;
                }
            }
            if (this.hour === 23) {
                this.hour = 0;

                return;
            }
            this.hour++;
        },

        incrementMinute: function(step) {
            var newVal;

            if (step) {
                newVal = this.minute + step;
            } else {
                newVal = this.minute + this.minuteStep - (this.minute % this.minuteStep);
            }

            if (newVal > 59) {
                this.incrementHour();
                this.minute = newVal - 60;
            } else {
                this.minute = newVal;
            }
        },

        incrementSecond: function() {
            var newVal = this.second + this.secondStep - (this.second % this.secondStep);

            if (newVal > 59) {
                this.incrementMinute(true);
                this.second = newVal - 60;
            } else {
                this.second = newVal;
            }
        },

        mousewheel: function(e) {
            if (this.disableMousewheel) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail,
                scrollTo = null;

            if (e.type === 'mousewheel') {
                scrollTo = (e.originalEvent.wheelDelta * -1);
            } else if (e.type === 'DOMMouseScroll') {
                scrollTo = 40 * e.originalEvent.detail;
            }

            if (scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }

            switch (this.highlightedUnit) {
                case 'minute':
                    if (delta > 0) {
                        this.incrementMinute();
                    } else {
                        this.decrementMinute();
                    }
                    this.highlightMinute();
                    break;
                case 'second':
                    if (delta > 0) {
                        this.incrementSecond();
                    } else {
                        this.decrementSecond();
                    }
                    this.highlightSecond();
                    break;
                case 'meridian':
                    this.toggleMeridian();
                    this.highlightMeridian();
                    break;
                default:
                    if (delta > 0) {
                        this.incrementHour();
                    } else {
                        this.decrementHour();
                    }
                    this.highlightHour();
                    break;
            }

            return false;
        },

        // This method was adapted from bootstrap-datepicker.
        place: function() {
            if (this.isInline) {
                return;
            }
            var widgetWidth = this.$widget.outerWidth(),
                widgetHeight = this.$widget.outerHeight(),
                visualPadding = 10,
                windowWidth =
                    $(window).width(),
                windowHeight = $(window).height(),
                scrollTop = $(window).scrollTop();

            var zIndex = parseInt(this.$element.parents().filter(function() {}).first().css('z-index'), 10) + 10;
            var offset = this.component ? this.component.parent().offset() : this.$element.offset();
            var height = this.component ? this.component.outerHeight(true) : this.$element.outerHeight(false);
            var width = this.component ? this.component.outerWidth(true) : this.$element.outerWidth(false);
            var left = offset.left,
                top = offset.top;

            this.$widget.removeClass('timepicker-orient-top timepicker-orient-bottom timepicker-orient-right timepicker-orient-left');

            if (this.orientation.x !== 'auto') {
                this.picker.addClass('datepicker-orient-' + this.orientation.x);
                if (this.orientation.x === 'right') {
                    left -= widgetWidth - width;
                }
            } else {
                // auto x orientation is best-placement: if it crosses a window edge, fudge it sideways
                // Default to left
                this.$widget.addClass('timepicker-orient-left');
                if (offset.left < 0) {
                    left -= offset.left - visualPadding;
                } else if (offset.left + widgetWidth > windowWidth) {
                    left = windowWidth - widgetWidth - visualPadding;
                }
            }
            // auto y orientation is best-situation: top or bottom, no fudging, decision based on which shows more of the widget
            var yorient = this.orientation.y,
                topOverflow, bottomOverflow;
            if (yorient === 'auto') {
                topOverflow = -scrollTop + offset.top - widgetHeight;
                bottomOverflow = scrollTop + windowHeight - (offset.top + height + widgetHeight);
                if (Math.max(topOverflow, bottomOverflow) === bottomOverflow) {
                    yorient = 'top';
                } else {
                    yorient = 'bottom';
                }
            }
            this.$widget.addClass('timepicker-orient-' + yorient);
            if (yorient === 'top') {
                top += height;
            } else {
                top -= widgetHeight + parseInt(this.$widget.css('padding-top'), 10);
            }

            this.$widget.css({
                top: top,
                left: left,
                zIndex: zIndex
            });
        },

        remove: function() {
            $('document').off('.timepicker');
            if (this.$widget) {
                this.$widget.remove();
            }
            delete this.$element.data().timepicker;
        },

        setDefaultTime: function(defaultTime) {
            if (!this.$element.val()) {
                if (defaultTime === 'current') {
                    var dTime = new Date(),
                        hours = dTime.getHours(),
                        minutes = dTime.getMinutes(),
                        seconds = dTime.getSeconds(),
                        meridian = 'AM';

                    if (seconds !== 0) {
                        seconds = Math.ceil(dTime.getSeconds() / this.secondStep) * this.secondStep;
                        if (seconds === 60) {
                            minutes += 1;
                            seconds = 0;
                        }
                    }

                    if (minutes !== 0) {
                        minutes = Math.ceil(dTime.getMinutes() / this.minuteStep) * this.minuteStep;
                        if (minutes === 60) {
                            hours += 1;
                            minutes = 0;
                        }
                    }

                    if (this.showMeridian) {
                        if (hours === 0) {
                            hours = 12;
                        } else if (hours >= 12) {
                            if (hours > 12) {
                                hours = hours - 12;
                            }
                            meridian = 'PM';
                        } else {
                            meridian = 'AM';
                        }
                    }

                    this.hour = hours;
                    this.minute = minutes;
                    this.second = seconds;
                    this.meridian = meridian;

                    this.update();

                } else if (defaultTime === false) {
                    this.hour = 0;
                    this.minute = 0;
                    this.second = 0;
                    this.meridian = 'AM';
                } else {
                    this.setTime(defaultTime);
                }
            } else {
                this.updateFromElementVal();
            }
        },

        setTime: function(time, ignoreWidget) {
            if (!time) {
                this.clear();
                return;
            }

            var timeArray,
                hour,
                minute,
                second,
                meridian;

            if (typeof time === 'object' && time.getMonth) {
                // this is a date object
                hour = time.getHours();
                minute = time.getMinutes();
                second = time.getSeconds();

                if (this.showMeridian) {
                    meridian = 'AM';
                    if (hour > 12) {
                        meridian = 'PM';
                        hour = hour % 12;
                    }

                    if (hour === 12) {
                        meridian = 'PM';
                    }
                }
            } else {
                if (time.match(/p/i) !== null) {
                    meridian = 'PM';
                } else {
                    meridian = 'AM';
                }

                time = time.replace(/[^0-9\:]/g, '');

                timeArray = time.split(':');

                hour = timeArray[0] ? timeArray[0].toString() : timeArray.toString();
                minute = timeArray[1] ? timeArray[1].toString() : '';
                second = timeArray[2] ? timeArray[2].toString() : '';

                // idiot proofing
                if (hour.length > 4) {
                    second = hour.substr(4, 2);
                }
                if (hour.length > 2) {
                    minute = hour.substr(2, 2);
                    hour = hour.substr(0, 2);
                }
                if (minute.length > 2) {
                    second = minute.substr(2, 2);
                    minute = minute.substr(0, 2);
                }
                if (second.length > 2) {
                    second = second.substr(2, 2);
                }

                hour = parseInt(hour, 10);
                minute = parseInt(minute, 10);
                second = parseInt(second, 10);

                if (isNaN(hour)) {
                    hour = 0;
                }
                if (isNaN(minute)) {
                    minute = 0;
                }
                if (isNaN(second)) {
                    second = 0;
                }

                if (this.showMeridian) {
                    if (hour < 1) {
                        hour = 1;
                    } else if (hour > 12) {
                        hour = 12;
                    }
                } else {
                    if (hour >= 24) {
                        hour = 23;
                    } else if (hour < 0) {
                        hour = 0;
                    }
                    if (hour < 13 && meridian === 'PM') {
                        hour = hour + 12;
                    }
                }

                if (minute < 0) {
                    minute = 0;
                } else if (minute >= 60) {
                    minute = 59;
                }

                if (this.showSeconds) {
                    if (isNaN(second)) {
                        second = 0;
                    } else if (second < 0) {
                        second = 0;
                    } else if (second >= 60) {
                        second = 59;
                    }
                }
            }

            this.hour = hour;
            this.minute = minute;
            this.second = second;
            this.meridian = meridian;

            this.update(ignoreWidget);
        },

        showWidget: function() {
            if (this.isOpen) {
                return;
            }

            if (this.$element.is(':disabled')) {
                return;
            }

            // show/hide approach taken by datepicker
            this.$widget.appendTo(this.appendWidgetTo);
            var self = this;
            $(document).on('mousedown.timepicker, touchend.timepicker', function(e) {
                // This condition was inspired by bootstrap-datepicker.
                // The element the timepicker is invoked on is the input but it has a sibling for addon/button.
                if (!(self.$element.parent().find(e.target).length ||
                    self.$widget.is(e.target) ||
                    self.$widget.find(e.target).length)) {
                    self.hideWidget();
                }
            });

            this.$element.trigger({
                'type': 'show.timepicker',
                'time': {
                    'value': this.getTime(),
                    'hours': this.hour,
                    'minutes': this.minute,
                    'seconds': this.second,
                    'meridian': this.meridian
                }
            });

            this.place();
            if (this.disableFocus) {
                this.$element.blur();
            }

            // widget shouldn't be empty on open
            if (this.hour === '') {
                if (this.defaultTime) {
                    this.setDefaultTime(this.defaultTime);
                } else {
                    this.setTime('0:0:0');
                }
            }

            if (this.template === 'modal' && this.$widget.modal) {
                this.$widget.modal('show').on('hidden', $.proxy(this.hideWidget, this));
            } else {
                if (this.isOpen === false) {
                    this.$widget.addClass('open');
                }
            }

            this.isOpen = true;
        },

        toggleMeridian: function() {
            this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';
        },

        update: function(ignoreWidget) {
            this.updateElement();
            if (!ignoreWidget) {
                this.updateWidget();
            }

            this.$element.trigger({
                'type': 'changeTime.timepicker',
                'time': {
                    'value': this.getTime(),
                    'hours': this.hour,
                    'minutes': this.minute,
                    'seconds': this.second,
                    'meridian': this.meridian
                }
            });
        },

        updateElement: function() {
            this.$element.val(this.getTime()).change();
        },

        updateFromElementVal: function() {
            this.setTime(this.$element.val());
        },

        updateWidget: function() {
            if (this.$widget === false) {
                return;
            }

            var hour = this.hour,
                minute = this.minute.toString().length === 1 ? '0' + this.minute : this.minute,
                second = this.second.toString().length === 1 ? '0' + this.second : this.second;

            if (this.showInputs) {
                this.$widget.find('input.bootstrap-timepicker-hour').val(hour);
                this.$widget.find('input.bootstrap-timepicker-minute').val(minute);

                if (this.showSeconds) {
                    this.$widget.find('input.bootstrap-timepicker-second').val(second);
                }
                if (this.showMeridian) {
                    this.$widget.find('input.bootstrap-timepicker-meridian').val(this.meridian);
                }
            } else {
                this.$widget.find('span.bootstrap-timepicker-hour').text(hour);
                this.$widget.find('span.bootstrap-timepicker-minute').text(minute);

                if (this.showSeconds) {
                    this.$widget.find('span.bootstrap-timepicker-second').text(second);
                }
                if (this.showMeridian) {
                    this.$widget.find('span.bootstrap-timepicker-meridian').text(this.meridian);
                }
            }
        },

        updateFromWidgetInputs: function() {
            if (this.$widget === false) {
                return;
            }

            var t = this.$widget.find('input.bootstrap-timepicker-hour').val() + ':' +
                this.$widget.find('input.bootstrap-timepicker-minute').val() +
                (this.showSeconds ? ':' + this.$widget.find('input.bootstrap-timepicker-second').val() : '') +
                (this.showMeridian ? this.$widget.find('input.bootstrap-timepicker-meridian').val() : '');

            this.setTime(t, true);
        },

        widgetClick: function(e) {
            e.stopPropagation();
            e.preventDefault();

            var $input = $(e.target),
                action = $input.closest('a').data('action');

            if (action) {
                this[action]();
            }
            this.update();

            if ($input.is('input')) {
                $input.get(0).setSelectionRange(0, 2);
            }
        },

        widgetKeydown: function(e) {
            var $input = $(e.target),
                name = $input.attr('class').replace('bootstrap-timepicker-', '');

            switch (e.keyCode) {
                case 9: //tab
                    if ((this.showMeridian && name === 'meridian') || (this.showSeconds && name === 'second') || (!this.showMeridian && !this.showSeconds && name === 'minute')) {
                        return this.hideWidget();
                    }
                    break;
                case 27: // escape
                    this.hideWidget();
                    break;
                case 38: // up arrow
                    e.preventDefault();
                    switch (name) {
                        case 'hour':
                            this.incrementHour();
                            break;
                        case 'minute':
                            this.incrementMinute();
                            break;
                        case 'second':
                            this.incrementSecond();
                            break;
                        case 'meridian':
                            this.toggleMeridian();
                            break;
                    }
                    this.setTime(this.getTime());
                    $input.get(0).setSelectionRange(0, 2);
                    break;
                case 40: // down arrow
                    e.preventDefault();
                    switch (name) {
                        case 'hour':
                            this.decrementHour();
                            break;
                        case 'minute':
                            this.decrementMinute();
                            break;
                        case 'second':
                            this.decrementSecond();
                            break;
                        case 'meridian':
                            this.toggleMeridian();
                            break;
                    }
                    this.setTime(this.getTime());
                    $input.get(0).setSelectionRange(0, 2);
                    break;
            }
        },

        widgetKeyup: function(e) {
            if ((e.keyCode === 65) || (e.keyCode === 77) || (e.keyCode === 80) || (e.keyCode === 46) || (e.keyCode === 8) || (e.keyCode >= 46 && e.keyCode <= 57)) {
                this.updateFromWidgetInputs();
            }
        }
    };

    //TIMEPICKER PLUGIN DEFINITION
    $.fn.timepicker = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function() {
            var $this = $(this),
                data = $this.data('timepicker'),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data('timepicker', (data = new Timepicker(this, $.extend({}, $.fn.timepicker.defaults, options, $(this).data()))));
            }

            if (typeof option === 'string') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.timepicker.defaults = {
        defaultTime: 'current',
        disableFocus: false,
        disableMousewheel: false,
        isOpen: false,
        minuteStep: 15,
        modalBackdrop: false,
        orientation: {
            x: 'auto',
            y: 'auto'
        },
        secondStep: 15,
        showSeconds: false,
        showInputs: true,
        showMeridian: true,
        template: 'dropdown',
        appendWidgetTo: 'body',
        showWidgetOnAddonClick: true
    };

    $.fn.timepicker.Constructor = Timepicker;

})(jQuery, window, document);;/* ========================================================================
 * Bootstrap: alert.js v3.1.1
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.1.1
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.1.1
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return this.sliding = false

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid.bs.carousel', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid.bs.carousel') }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid.bs.carousel')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.1.1
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).focus()
  }

  function clearMenus(e) {
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.1.1
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.1.1
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return
      var that = this;

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.hoverState = null

      var complete = function() {
        that.$element.trigger('shown.bs.' + that.type)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one($.support.transition.end, complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.1.1
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.1.1
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.1.1
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.RESET = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$window.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (this.affixed == 'top') position.top += scrollTop

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({ top: scrollHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.1.1
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.1.1
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.1.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'MozTransition'    : 'transitionend',
      'OTransition'      : 'oTransitionEnd otransitionend',
      'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(jQuery);
;(function() {
    var $, cardFromNumber, cardFromType, cards, defaultFormat, formatBackCardNumber, formatBackExpiry, formatCardNumber, formatExpiry, formatForwardExpiry, formatForwardSlash, hasTextSelected, luhnCheck, reFormatCardNumber, restrictCVC, restrictCardNumber, restrictExpiry, restrictNumeric, setCardType,
        __slice = [].slice,
        __indexOf = [].indexOf || function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        },
        _this = this;

    $ = jQuery;

    $.payment = {};

    $.payment.fn = {};

    $.fn.payment = function() {
        var args, method;
        method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return $.payment.fn[method].apply(this, args);
    };

    defaultFormat = /(\d{1,4})/g;

    cards = [{
        type: 'maestro',
        pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
        format: defaultFormat,
        length: [12, 13, 14, 15, 16, 17, 18, 19],
        cvcLength: [3],
        luhn: true
    }, {
        type: 'dinersclub',
        pattern: /^(36|38|30[0-5])/,
        format: defaultFormat,
        length: [14],
        cvcLength: [3],
        luhn: true
    }, {
        type: 'laser',
        pattern: /^(6706|6771|6709)/,
        format: defaultFormat,
        length: [16, 17, 18, 19],
        cvcLength: [3],
        luhn: true
    }, {
        type: 'jcb',
        pattern: /^35/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
    }, {
        type: 'unionpay',
        pattern: /^62/,
        format: defaultFormat,
        length: [16, 17, 18, 19],
        cvcLength: [3],
        luhn: false
    }, {
        type: 'discover',
        pattern: /^(6011|65|64[4-9]|622)/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
    }, {
        type: 'mastercard',
        pattern: /^5[1-5]/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
    }, {
        type: 'amex',
        pattern: /^3[47]/,
        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
        length: [15],
        cvcLength: [3, 4],
        luhn: true
    }, {
        type: 'visa',
        pattern: /^4/,
        format: defaultFormat,
        length: [13, 14, 15, 16],
        cvcLength: [3],
        luhn: true
    }];

    cardFromNumber = function(num) {
        var card, _i, _len;
        num = (num + '').replace(/\D/g, '');
        for (_i = 0, _len = cards.length; _i < _len; _i++) {
            card = cards[_i];
            if (card.pattern.test(num)) {
                return card;
            }
        }
    };

    cardFromType = function(type) {
        var card, _i, _len;
        for (_i = 0, _len = cards.length; _i < _len; _i++) {
            card = cards[_i];
            if (card.type === type) {
                return card;
            }
        }
    };

    luhnCheck = function(num) {
        var digit, digits, odd, sum, _i, _len;
        odd = true;
        sum = 0;
        digits = (num + '').split('').reverse();
        for (_i = 0, _len = digits.length; _i < _len; _i++) {
            digit = digits[_i];
            digit = parseInt(digit, 10);
            if ((odd = !odd)) {
                digit *= 2;
            }
            if (digit > 9) {
                digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 === 0;
    };

    hasTextSelected = function($target) {
        var _ref;
        if (($target.prop('selectionStart') != null) && $target.prop('selectionStart') !== $target.prop('selectionEnd')) {
            return true;
        }
        if (typeof document !== "undefined" && document !== null ? (_ref = document.selection) != null ? typeof _ref.createRange === "function" ? _ref.createRange().text : void 0 : void 0 : void 0) {
            return true;
        }
        return false;
    };

    reFormatCardNumber = function(e) {
        var _this = this;
        return setTimeout(function() {
            var $target, value;
            $target = $(e.currentTarget);
            value = $target.val();
            value = $.payment.formatCardNumber(value);
            return $target.val(value);
        });
    };

    formatCardNumber = function(e) {
        var $target, card, digit, length, re, upperLength, value;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        $target = $(e.currentTarget);
        value = $target.val();
        card = cardFromNumber(value + digit);
        length = (value.replace(/\D/g, '') + digit).length;
        upperLength = 16;
        if (card) {
            upperLength = card.length[card.length.length - 1];
        }
        if (length >= upperLength) {
            return;
        }
        if (($target.prop('selectionStart') != null) && $target.prop('selectionStart') !== value.length) {
            return;
        }
        if (card && card.type === 'amex') {
            re = /^(\d{4}|\d{4}\s\d{6})$/;
        } else {
            re = /(?:^|\s)(\d{4})$/;
        }
        if (re.test(value)) {
            e.preventDefault();
            return $target.val(value + ' ' + digit);
        } else if (re.test(value + digit)) {
            e.preventDefault();
            return $target.val(value + digit + ' ');
        }
    };

    formatBackCardNumber = function(e) {
        var $target, value;
        $target = $(e.currentTarget);
        value = $target.val();
        if (e.meta) {
            return;
        }
        if (e.which !== 8) {
            return;
        }
        if (($target.prop('selectionStart') != null) && $target.prop('selectionStart') !== value.length) {
            return;
        }
        if (/\d\s$/.test(value)) {
            e.preventDefault();
            return $target.val(value.replace(/\d\s$/, ''));
        } else if (/\s\d?$/.test(value)) {
            e.preventDefault();
            return $target.val(value.replace(/\s\d?$/, ''));
        }
    };

    formatExpiry = function(e) {
        var $target, digit, val;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        $target = $(e.currentTarget);
        val = $target.val() + digit;
        if (/^\d$/.test(val) && (val !== '0' && val !== '1')) {
            e.preventDefault();
            return $target.val("0" + val + " / ");
        } else if (/^\d\d$/.test(val)) {
            e.preventDefault();
            return $target.val("" + val + " / ");
        }
    };

    formatForwardExpiry = function(e) {
        var $target, digit, val;
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        $target = $(e.currentTarget);
        val = $target.val();
        if (/^\d\d$/.test(val)) {
            return $target.val("" + val + " / ");
        }
    };

    formatForwardSlash = function(e) {
        var $target, slash, val;
        slash = String.fromCharCode(e.which);
        if (slash !== '/') {
            return;
        }
        $target = $(e.currentTarget);
        val = $target.val();
        if (/^\d$/.test(val) && val !== '0') {
            return $target.val("0" + val + " / ");
        }
    };

    formatBackExpiry = function(e) {
        var $target, value;
        if (e.meta) {
            return;
        }
        $target = $(e.currentTarget);
        value = $target.val();
        if (e.which !== 8) {
            return;
        }
        if (($target.prop('selectionStart') != null) && $target.prop('selectionStart') !== value.length) {
            return;
        }
        if (/\d(\s|\/)+$/.test(value)) {
            e.preventDefault();
            return $target.val(value.replace(/\d(\s|\/)*$/, ''));
        } else if (/\s\/\s?\d?$/.test(value)) {
            e.preventDefault();
            return $target.val(value.replace(/\s\/\s?\d?$/, ''));
        }
    };

    restrictNumeric = function(e) {
        var input;
        if (e.metaKey || e.ctrlKey) {
            return true;
        }
        if (e.which === 32) {
            return false;
        }
        if (e.which === 0) {
            return true;
        }
        if (e.which < 33) {
            return true;
        }
        input = String.fromCharCode(e.which);
        return !!/[\d\s]/.test(input);
    };

    restrictCardNumber = function(e) {
        var $target, card, digit, value;
        $target = $(e.currentTarget);
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        if (hasTextSelected($target)) {
            return;
        }
        value = ($target.val() + digit).replace(/\D/g, '');
        card = cardFromNumber(value);
        if (card) {
            return value.length <= card.length[card.length.length - 1];
        } else {
            return value.length <= 16;
        }
    };

    restrictExpiry = function(e) {
        var $target, digit, value;
        $target = $(e.currentTarget);
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        if (hasTextSelected($target)) {
            return;
        }
        value = $target.val() + digit;
        value = value.replace(/\D/g, '');
        if (value.length > 6) {
            return false;
        }
    };

    restrictCVC = function(e) {
        var $target, digit, val;
        $target = $(e.currentTarget);
        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
            return;
        }
        val = $target.val() + digit;
        return val.length <= 4;
    };

    setCardType = function(e) {
        var $target, allTypes, card, cardType, val;
        $target = $(e.currentTarget);
        val = $target.val();
        cardType = $.payment.cardType(val) || 'unknown';
        if (!$target.hasClass(cardType)) {
            allTypes = (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = cards.length; _i < _len; _i++) {
                    card = cards[_i];
                    _results.push(card.type);
                }
                return _results;
            })();
            $target.removeClass('unknown');
            $target.removeClass(allTypes.join(' '));
            $target.addClass(cardType);
            $target.toggleClass('identified', cardType !== 'unknown');
            return $target.trigger('payment.cardType', cardType);
        }
    };

    $.payment.fn.formatCardCVC = function() {
        this.payment('restrictNumeric');
        this.on('keypress', restrictCVC);
        return this;
    };

    $.payment.fn.formatCardExpiry = function() {
        this.payment('restrictNumeric');
        this.on('keypress', restrictExpiry);
        this.on('keypress', formatExpiry);
        this.on('keypress', formatForwardSlash);
        this.on('keypress', formatForwardExpiry);
        this.on('keydown', formatBackExpiry);
        return this;
    };

    $.payment.fn.formatCardNumber = function() {
        this.payment('restrictNumeric');
        this.on('keypress', restrictCardNumber);
        this.on('keypress', formatCardNumber);
        this.on('keydown', formatBackCardNumber);
        this.on('keyup', setCardType);
        this.on('paste', reFormatCardNumber);
        return this;
    };

    $.payment.fn.restrictNumeric = function() {
        this.on('keypress', restrictNumeric);
        return this;
    };

    $.payment.fn.cardExpiryVal = function() {
        return $.payment.cardExpiryVal($(this).val());
    };

    $.payment.cardExpiryVal = function(value) {
        var month, prefix, year, _ref;
        value = value.replace(/\s/g, '');
        _ref = value.split('/', 2), month = _ref[0], year = _ref[1];
        if ((year != null ? year.length : void 0) === 2 && /^\d+$/.test(year)) {
            prefix = (new Date).getFullYear();
            prefix = prefix.toString().slice(0, 2);
            year = prefix + year;
        }
        month = parseInt(month, 10);
        year = parseInt(year, 10);
        return {
            month: month,
            year: year
        };
    };

    $.payment.validateCardNumber = function(num) {
        var card, _ref;
        num = (num + '').replace(/\s+|-/g, '');
        if (!/^\d+$/.test(num)) {
            return false;
        }
        card = cardFromNumber(num);
        if (!card) {
            return false;
        }
        return (_ref = num.length, __indexOf.call(card.length, _ref) >= 0) && (card.luhn === false || luhnCheck(num));
    };

    $.payment.validateCardExpiry = function(month, year) {
        var currentTime, expiry, prefix, _ref;
        if (typeof month === 'object' && 'month' in month) {
            _ref = month, month = _ref.month, year = _ref.year;
        }
        if (!(month && year)) {
            return false;
        }
        month = $.trim(month);
        year = $.trim(year);
        if (!/^\d+$/.test(month)) {
            return false;
        }
        if (!/^\d+$/.test(year)) {
            return false;
        }
        if (!(parseInt(month, 10) <= 12)) {
            return false;
        }
        if (year.length === 2) {
            prefix = (new Date).getFullYear();
            prefix = prefix.toString().slice(0, 2);
            year = prefix + year;
        }
        expiry = new Date(year, month);
        currentTime = new Date;
        expiry.setMonth(expiry.getMonth() - 1);
        expiry.setMonth(expiry.getMonth() + 1, 1);
        return expiry > currentTime;
    };

    $.payment.validateCardCVC = function(cvc, type) {
        var _ref, _ref1;
        cvc = $.trim(cvc);
        if (!/^\d+$/.test(cvc)) {
            return false;
        }
        if (type) {
            return _ref = cvc.length, __indexOf.call((_ref1 = cardFromType(type)) != null ? _ref1.cvcLength : void 0, _ref) >= 0;
        } else {
            return cvc.length >= 3 && cvc.length <= 4;
        }
    };

    $.payment.cardType = function(num) {
        var _ref;
        if (!num) {
            return null;
        }
        return ((_ref = cardFromNumber(num)) != null ? _ref.type : void 0) || null;
    };

    $.payment.formatCardNumber = function(num) {
        var card, groups, upperLength, _ref;
        card = cardFromNumber(num);
        if (!card) {
            return num;
        }
        upperLength = card.length[card.length.length - 1];
        num = num.replace(/\D/g, '');
        num = num.slice(0, +upperLength + 1 || 9e9);
        if (card.format.global) {
            return (_ref = num.match(card.format)) != null ? _ref.join(' ') : void 0;
        } else {
            groups = card.format.exec(num);
            if (groups != null) {
                groups.shift();
            }
            return groups != null ? groups.join(' ') : void 0;
        }
    };

}).call(this);;/**
 * jQuery Countdown
 *
 * Provides a javascript countdown timer based on the data-countdown attribute or by
 * passing a schedule of events via options. It will default to data-countdown if the
 * attribute is present, then the next day in a schedule if you pass one, and
 * then it will fail silently as last result if neither of these are present.
 *
 * @author Kaleb Heitzman <kaleblex@gmail.com>
 * @website http://github.com/kaleblex/jquery-countdown.js
 * @created March 12, 2013
 *
 */
;
(function($) {

    /**
     * Countdown
     */
    $.fn.countdown = function(options) {

        // default options
        defaults = {
            schedule: null,
            datetime: null,
            showYears: false,
            showDays: true,
            showHours: true,
            showMinutes: true,
            showSeconds: true,
            showOnZeroYears: false,
            showOnZeroDays: true,
            showOnZeroHours: true,
            showOnZeroMinutes: true,
            showOnZeroSeconds: true,
            unixFormat: false
        };

        /**
         * Extend the options
         */
        var options = $.extend({
            timerCallback: function(options) {},
            initCallback: function(options) {},
            zeroCallback: function(options) {}
        }, defaults, options);

        /**
         * Check for a specified datetime and use ternary to apply value
         */
        options.datetime = $(this).attr('data-countdown') ? $(this).attr('data-countdown') : null;

        /**
         * Run Countdown on Element
         */
        return this.each(function() {

            /**
             * Calculate Upcoming Day
             *
             * Calculate what the upcoming day is based on a combination of schedules
             * and date-time attribute. If a date-time attribute is used, it should be
             * used first. If a schedule is passed, calculate the date and time based
             * on the schedule
             */
            var upcomingDate = scheduler(options);

            /**
             * Get the element to update
             */
            var element = $(this);

            /**
             * Start the timer
             *
             * The time will update the element every one second.
             */
            var intervalHandle = setInterval(function() {
                // get the timerObject
                var timerObject = makeTimer(upcomingDate, options);
                // set the timerObject in options
                options.timerObject = timerObject;
                // create the HTML
                var timerHtml = htmlParser(timerObject, options);
                /**
                 * Update the HTML for the counter
                 */
                updateElement(element, timerHtml, options);
                /** 
                 * Check for zeroCallback
                 */
                if (timerObject.timeLeft <= 0) {
                    /**
                     * Clear the interval because it's no longer needed
                     */
                    clearInterval(intervalHandle);
                    /**
                     * Call the zeroCallback to see if there is anything to perform.
                     */
                    options.zeroCallback(options);
                }
                /**
                 * call the callback timer
                 */
                else {
                    options.timerCallback(options);
                }
            }, 1000);

        });

        /**
         * An overball callback
         */
        options.initCallback.call(this);

    };

    /**
     * Update the element
     *
     * Updates the html inside of the element that plugin is attached to based on
     * schedule or date-time attr.
     */
    var updateElement = function(element, html, options) {
        // update the html
        $(element).html(html);
    }

    /**
     * Scheduler
     *
     * Returns Human Readable date string based on a combination of scheduel,
     * date-time attr, and current datetime.
     */
    var scheduler = function(options) {

        /**
         * Check for registerd data-countdown attr.
         *
         * If the date-time attr is filled in, skip schedule checking and return
         * the passed data-countdown directly.
         */
        if (options.datetime != null) {
            return options.datetime;
        }

        /**
         * Set a blank array to store date and time sin
         */
        var upcomingDates = [];

        /**
         * Process the schedule
         */
        for (var day in options.schedule) {
            // get the next upcoming date
            var nextDate = nextDayByName(day);
            // get the time foreach each future date and push it to upcomingDates
            for (var time in options.schedule[day]) {
                // create a time string to push onto the upcomingDates array
                var timeString = nextDate + " " + options.schedule[day][time];
                // push the string onto the array
                upcomingDates.push(timeString);
            }
        }

        /**
         * Create the schedule to compare times agains
         */
        schedule = [];
        for (var key in upcomingDates) {
            schedule.push(new Date(upcomingDates[key]));
        }

        /**
         * Create the parsed schedule
         */
        parsedSchedule = [];
        for (var key in schedule) {
            parsedSchedule.push(Date.parse(schedule[key]) / 1000);
        }

        /**
         * Current Time
         */
        var currentTime = new Date(),
            currentTimeParsed = Date.parse(currentTime) / 1000;


        /**
         * Build time differences
         */
        timeDifferences = [];
        for (var key in parsedSchedule) {
            timeDifferences.push(parsedSchedule[key] - currentTimeParsed);
        }

        /**
         * Check for Negative
         */
        timeDifferencesParsed = [];
        for (key in timeDifferences) {
            if (timeDifferences[key] > 0) {
                timeDifferencesParsed.push(timeDifferences[key]);
            }
        }

        /**
         * Get the shortest time and store it in key
         */
        var shortTime = Math.min.apply(null, timeDifferencesParsed);
        for (var prop in timeDifferences) {
            if (shortTime == timeDifferences[prop]) {
                var shortTimeKey = prop;
            }
        }

        /**
         * Get the next scheduled date
         */
        var scheduledDate = upcomingDates[shortTimeKey];

        /** 
         * Return the scheduledDate if it's not blank.
         */
        if (scheduledDate != "") {
            return scheduledDate;
        }

        /** 
         * When all else fails return null
         */
        return null;
    }

    /**
     * Make Timer
     *
     * This is the timing method. This will be called every 1 second to return
     * the html needed to be placed in $(this.element)
     */
    var makeTimer = function(upcomingDate, options) {


        /**
         * Check for null upcomingDate
         */
        if (upcomingDate == null) {
            return "";
        }

        /**
         * Current Time and Date
         */
        var currentTime = new Date();

        /**
         * Convert Dates
         *
         * Convert the dates to a time string to calculate differences.
         */
        if (options.unixFormat) {
            var endTime = (upcomingDate / 1000);
        } else {
            var endTime = (Date.parse(upcomingDate) / 1000);
        }


        var currentTime = (Date.parse(currentTime) / 1000);

        /**
         * Time Left
         */
        var timeLeft = endTime - currentTime;

        /**
         * Set some vars for use
         */
        var years = 0;
        var days = 0;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;

        /**
         * Intercept on <= 0 and calculate differences based on timeLeft
         */
        if (timeLeft > 0) {
            var years = Math.floor((timeLeft / 31536000));
            var days = Math.floor((timeLeft / 86400));
            var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
            var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
            var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
            // adjust days for for more than 1 year
            if (days > 365) {
                days = days % 365;
            }
        }

        // create the Timer Object
        var timerObject = {
            "years": years,
            "days": days,
            "hours": hours,
            "minutes": minutes,
            "seconds": seconds,
            "timeLeft": timeLeft
        };

        // return Timer Object
        return timerObject;
    }

    /**
     * Parses a Timer Object to create html
     */
    var htmlParser = function(timerObject, options, format) {

        /**
         * Adjust for zero
         */
        if (timerObject.years < "10") {
            timerObject.years = "0" + timerObject.years;
        }
        if (timerObject.days < "10") {
            timerObject.days = "0" + timerObject.days;
        }
        if (timerObject.hours < "10") {
            timerObject.hours = "0" + timerObject.hours;
        }
        if (timerObject.minutes < "10") {
            timerObject.minutes = "0" + timerObject.minutes;
        }
        if (timerObject.seconds < "10") {
            timerObject.seconds = "0" + timerObject.seconds;
        }

        /**
         * Counter HTML to be passed back to the element
         */
        var counter_years = '<div class="years"><span class="count">' + timerObject.years + '</span><span class="title">Years</span></div>';
        var counter_days = '<div class="days"><span class="count">' + timerObject.days + '</span><span class="title">Days</span></div>';
        var counter_hours = '<div class="hours"><span class="count">' + timerObject.hours + '</span><span class="title">Hours</span></div>';
        var counter_minutes = '<div class="minutes"><span class="count">' + timerObject.minutes + '</span><span class="title">Minutes</span></div>';
        var counter_seconds = '<div class="seconds"><span class="count">' + timerObject.seconds + '</span><span class="title">Seconds</span></div>';

        /**
         * Setup string inclusions
         */
        var includeYears = false,
            includeDays = false,
            includeHours = false,
            includeMinutes = false,
            includeSeconds = false;

        /**
         * Options base show logic
         */
        if (options.showYears) {
            includeYears = true;
        }
        if (options.showDays) {
            includeDays = true;
        }
        if (options.showHours) {
            includeHours = true;
        }
        if (options.showMinutes) {
            includeMinutes = true;
        }
        if (options.showSeconds) {
            includeSeconds = true;
        }

        /**
         * Options showOnZero logic
         */
        if ((!options.showOnZeroYears) && (timerObject.years == "00")) {
            includeYears = false;
        }
        if ((!options.showOnZeroDays) && (timerObject.days == "00")) {
            includeDays = false;
        }
        if ((!options.showOnZeroHours) && (timerObject.hours == "00")) {
            includeHours = false;
        }
        if ((!options.showOnZeroMinutes) && (timerObject.minutes == "00")) {
            includeMinutes = false;
        }
        if ((!options.showOnZeroSeconds) && (timerObject.seconds == "00")) {
            includeSeconds = false;
        }

        /** Concatonate string
         */
        var counter_html = "";

        if (includeYears) {
            counter_html += counter_years;
        }
        if (includeDays) {
            counter_html += counter_days;
        }
        if (includeHours) {
            counter_html += counter_hours;
        }
        if (includeMinutes) {
            counter_html += counter_minutes;
        }
        if (includeSeconds) {
            counter_html += counter_seconds;
        }

        /**
         * Return the Counter HTML
         */
        return counter_html;
    }

    /** 
     * Next date via schedule or attribute
     */
    var nextDayByName = function(scheduledDay) {

        /**
         * Date Strings
         *
         * Setup some date string to calculate futures events
         */
        var D = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        /**
         * Get the key for the scheduleDay
         */
        for (var prop in D) {
            if (scheduledDay == D[prop]) {
                var whichNext = prop;
            }
        }

        /**
         * Current Date
         *
         * This is used to figure out the time difference to a
         * scheduled or data-countdown reference
         */
        var date = new Date();

        /**
         * Time Difference
         *
         * Calcuate the difference between the current date and scheduled date. Once
         * this has been calculated, we'll pass a human readable date back to the
         * countdown method.
         */
        var dif = date.getDay() - whichNext;
        dif = dif > 0 ? dif = 7 - dif : -dif;

        date.setDate(date.getDate() + dif);
        date.setHours(1); //DST pseudobug correction

        // get the day
        var dd = date.getDate();
        dd < 0 ? dd = '0' + dd : null;

        // get the year
        var yyyy = date.getFullYear();

        // get the month
        var mm = M[date.getMonth()];

        /**
         * Human Readable Date String
         *
         * Set the human readable datestring to be passed back, ex. January 01, 2013
         */
        var nextDatebyDayofWeek = mm + ' ' + dd + ', ' + yyyy;
        return nextDatebyDayofWeek;
    }

}(jQuery));;"use strict";

$('ul.slimmenu').slimmenu({
    resizeWidth: '992',
    collapserTitle: 'Main Menu',
    animSpeed: 250,
    indentChildren: true,
    childrenIndenter: ''
});


// Countdown
$('.countdown').each(function() {
    var count = $(this);
    $(this).countdown({
        zeroCallback: function(options) {
            var newDate = new Date(),
                newDate = newDate.setHours(newDate.getHours() + 130);

            $(count).attr("data-countdown", newDate);
            $(count).countdown({
                unixFormat: true
            });
        }
    });
});


$('.btn').button();

$("[rel='tooltip']").tooltip();

$('.form-group').each(function() {
    var self = $(this),
        input = self.find('input');

    input.focus(function() {
        self.addClass('form-group-focus');
    })

    input.blur(function() {
        if (input.val()) {
            self.addClass('form-group-filled');
        } else {
            self.removeClass('form-group-filled');
        }
        self.removeClass('form-group-focus');
    });
});

$('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 3,
    limit: 8
}, {
    source: function(q, cb) {
        return $.ajax({
            dataType: 'json',
            type: 'get',
            url: 'http://gd.geobytes.com/AutoCompleteCity?callback=?&q=' + q,
            chache: false,
            success: function(data) {
                var result = [];
                $.each(data, function(index, val) {
                    result.push({
                        value: val
                    });
                });
                cb(result);
            }
        });
    }
});


$('input.date-pick, .input-daterange, .date-pick-inline').datepicker({
    todayHighlight: true
});



$('input.date-pick, .input-daterange input[name="start"]').datepicker('setDate', 'today');
$('.input-daterange input[name="end"]').datepicker('setDate', '+7d');

$('input.time-pick').timepicker({
    minuteStep: 15,
    showInpunts: false
})

$('input.date-pick-years').datepicker({
    startView: 2
});




$('.booking-item-price-calc .checkbox label').click(function() {
    var checkbox = $(this).find('input'),
        // checked = $(checkboxDiv).hasClass('checked'),
        checked = $(checkbox).prop('checked'),
        price = parseInt($(this).find('span.pull-right').html().replace('$', '')),
        eqPrice = $('#car-equipment-total'),
        tPrice = $('#car-total'),
        eqPriceInt = parseInt(eqPrice.attr('data-value')),
        tPriceInt = parseInt(tPrice.attr('data-value')),
        value,
        animateInt = function(val, el, plus) {
            value = function() {
                if (plus) {
                    return el.attr('data-value', val + price);
                } else {
                    return el.attr('data-value', val - price);
                }
            };
            return $({
                val: val
            }).animate({
                val: parseInt(value().attr('data-value'))
            }, {
                duration: 500,
                easing: 'swing',
                step: function() {
                    if (plus) {
                        el.text(Math.ceil(this.val));
                    } else {
                        el.text(Math.floor(this.val));
                    }
                }
            });
        };
    if (!checked) {
        animateInt(eqPriceInt, eqPrice, true);
        animateInt(tPriceInt, tPrice, true);
    } else {
        animateInt(eqPriceInt, eqPrice, false);
        animateInt(tPriceInt, tPrice, false);
    }
});


$('div.bg-parallax').each(function() {
    var $obj = $(this);
    if($(window).width() > 992 ){
        $(window).scroll(function() {
            var animSpeed;
            if ($obj.hasClass('bg-blur')) {
                animSpeed = 10;
            } else {
                animSpeed = 15;
            }
            var yPos = -($(window).scrollTop() / animSpeed);
            var bgpos = '50% ' + yPos + 'px';
            $obj.css('background-position', bgpos);

        });
    }
});



$(document).ready(
    function() {

    $('html').niceScroll({
        cursorcolor: "#000",
        cursorborder: "0px solid #fff",
        railpadding: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        cursorwidth: "10px",
        cursorborderradius: "0px",
        cursoropacitymin: 0.2,
        cursoropacitymax: 0.8,
        boxzoom: true,
        horizrailenabled: false,
        zindex: 9999
    });


        // Owl Carousel
        var owlCarousel = $('#owl-carousel'),
            owlItems = owlCarousel.attr('data-items'),
            owlCarouselSlider = $('#owl-carousel-slider'),
            owlNav = owlCarouselSlider.attr('data-nav');
        // owlSliderPagination = owlCarouselSlider.attr('data-pagination');

        owlCarousel.owlCarousel({
            items: owlItems,
            navigation: true,
            navigationText: ['', '']
        });

        owlCarouselSlider.owlCarousel({
            slideSpeed: 300,
            paginationSpeed: 400,
            // pagination: owlSliderPagination,
            singleItem: true,
            navigation: true,
            navigationText: ['', ''],
            transitionStyle: 'fade',
            autoPlay: 4500
        });


    // footer always on bottom
   var docHeight = $(window).height();
   var footerHeight = $('#main-footer').height();
   var footerTop = $('#main-footer').position().top + footerHeight;
   
   if (footerTop < docHeight) {
    $('#main-footer').css('margin-top', (docHeight - footerTop) + 'px');
   }
    }


);


$('.nav-drop').dropit();


$("#price-slider").ionRangeSlider({
    min: 130,
    max: 575,
    type: 'double',
    prefix: "$",
    // maxPostfix: "+",
    prettify: false,
    hasGrid: true
});

$('.i-check, .i-radio').iCheck({
    checkboxClass: 'i-check',
    radioClass: 'i-radio'
});



$('.booking-item-review-expand').click(function(event) {
    console.log('baz');
    var parent = $(this).parent('.booking-item-review-content');
    if (parent.hasClass('expanded')) {
        parent.removeClass('expanded');
    } else {
        parent.addClass('expanded');
    }
});


$('.stats-list-select > li > .booking-item-rating-stars > li').each(function() {
    var list = $(this).parent(),
        listItems = list.children(),
        itemIndex = $(this).index();

    $(this).hover(function() {
        for (var i = 0; i < listItems.length; i++) {
            if (i <= itemIndex) {
                $(listItems[i]).addClass('hovered');
            } else {
                break;
            }
        };
        $(this).click(function() {
            for (var i = 0; i < listItems.length; i++) {
                if (i <= itemIndex) {
                    $(listItems[i]).addClass('selected');
                } else {
                    $(listItems[i]).removeClass('selected');
                }
            };
        });
    }, function() {
        listItems.removeClass('hovered');
    });
});



$('.booking-item-container').children('.booking-item').click(function(event) {
    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        $(this).parent().removeClass('active');
    } else {
        $(this).addClass('active');
        $(this).parent().addClass('active');
        $(this).delay(1500).queue(function() {
            $(this).addClass('viewed')
        });
    }
});


$('.form-group-cc-number input').payment('formatCardNumber');
$('.form-group-cc-date input').payment('formatCardExpiry');
$('.form-group-cc-cvc input').payment('formatCardCVC');




if ($('#map-canvas').length) {
    var map,
        service;

    jQuery(function($) {
        $(document).ready(function() {
            var latlng = new google.maps.LatLng(40.7564971, -73.9743277);
            var myOptions = {
                zoom: 16,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: false
            };

            map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);


            var marker = new google.maps.Marker({
                position: latlng,
                map: map
            });
            marker.setMap(map);


            $('a[href="#google-map-tab"]').on('shown.bs.tab', function(e) {
                google.maps.event.trigger(map, 'resize');
                map.setCenter(latlng);
            });
        });
    });
}


$('.card-select > li').click(function() {
    self = this;
    $(self).addClass('card-item-selected');
    $(self).siblings('li').removeClass('card-item-selected');
    $('.form-group-cc-number input').click(function() {
        $(self).removeClass('card-item-selected');
    });
});
// Lighbox gallery
$('#popup-gallery').each(function() {
    $(this).magnificPopup({
        delegate: 'a.popup-gallery-image',
        type: 'image',
        gallery: {
            enabled: true
        }
    });
});

// Lighbox image
$('.popup-image').magnificPopup({
    type: 'image'
});

// Lighbox text
$('.popup-text').magnificPopup({
    removalDelay: 500,
    closeBtnInside: true,
    callbacks: {
        beforeOpen: function() {
            this.st.mainClass = this.st.el.attr('data-effect');
        }
    },
    midClick: true
});

// Lightbox iframe
$('.popup-iframe').magnificPopup({
    dispableOn: 700,
    type: 'iframe',
    removalDelay: 160,
    mainClass: 'mfp-fade',
    preloader: false
});


$('.form-group-select-plus').each(function() {
    var self = $(this),
        btnGroup = self.find('.btn-group').first(),
        select = self.find('select');
    btnGroup.children('label').last().click(function() {
        btnGroup.addClass('hidden');
        select.removeClass('hidden');
    });
});
// Responsive videos
$(document).ready(function() {
    $("body").fitVids();
});

$(function($) {
    $("#twitter").tweet({
        username: "remtsoy", //!paste here your twitter username!
        count: 3
    });
});

$(function($) {
    $("#twitter-ticker").tweet({
        username: "remtsoy", //!paste here your twitter username!
        page: 1,
        count: 20
    });
});

$(document).ready(function() {
    var ul = $('#twitter-ticker').find(".tweet-list");
    var ticker = function() {
        setTimeout(function() {
            ul.find('li:first').animate({
                marginTop: '-4.7em'
            }, 850, function() {
                $(this).detach().appendTo(ul).removeAttr('style');
            });
            ticker();
        }, 5000);
    };
    ticker();
});
$(function() {
    $('#ri-grid').gridrotator({
        rows: 4,
        columns: 8,
        animType: 'random',
        animSpeed: 1200,
        interval: 1200,
        step: 'random',
        preventClick: false,
        maxStep: 2,
        w992: {
            rows: 5,
            columns: 4
        },
        w768: {
            rows: 6,
            columns: 3
        },
        w480: {
            rows: 8,
            columns: 3
        },
        w320: {
            rows: 5,
            columns: 4
        },
        w240: {
            rows: 6,
            columns: 4
        }
    });

});


$(function() {
    $('#ri-grid-no-animation').gridrotator({
        rows: 4,
        columns: 8,
        slideshow: false,
        w1024: {
            rows: 4,
            columns: 6
        },
        w768: {
            rows: 3,
            columns: 3
        },
        w480: {
            rows: 4,
            columns: 4
        },
        w320: {
            rows: 5,
            columns: 4
        },
        w240: {
            rows: 6,
            columns: 4
        }
    });

});

var tid = setInterval(tagline_vertical_slide, 2500);

// vertical slide
function tagline_vertical_slide() {
    var curr = $("#tagline ul li.active");
    curr.removeClass("active").addClass("vs-out");
    setTimeout(function() {
        curr.removeClass("vs-out");
    }, 500);

    var nextTag = curr.next('li');
    if (!nextTag.length) {
        nextTag = $("#tagline ul li").first();
    }
    nextTag.addClass("active");
}

function abortTimer() { // to be called when you want to stop the timer
    clearInterval(tid);
};/*
 * Dropit v1.0
 * http://dev7studios.com/dropit
 *
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

;
(function($) {

    $.fn.dropit = function(method) {

        var methods = {

            init: function(options) {
                this.dropit.settings = $.extend({}, this.dropit.defaults, options);
                return this.each(function() {
                    var $el = $(this),
                        el = this,
                        settings = $.fn.dropit.settings;

                    // // Hide initial submenus
                    // $el.addClass('dropit')
                    //     .find('>' + settings.triggerParentEl + ':has(' + settings.submenuEl + ')').addClass('dropit-trigger')

                    // Open on click
                    $el.on(settings.action, settings.this, function() {
                        if ($(this).hasClass('active-drop')) {
                            $(this).removeClass('active-drop');
                            return false;
                        }
                        settings.beforeHide.call(this);
                        $('.active-drop').removeClass('active-drop');
                        settings.afterHide.call(this);
                        settings.beforeShow.call(this);
                        $(this).addClass('active-drop');
                        settings.afterShow.call(this);
                        return false;
                    });

                    // Close if outside click
                    $(document).on('click', function() {
                        settings.beforeHide.call(this);
                        $('.active-drop').removeClass('active-drop').find('.dropit-submenu').hide();
                        settings.afterHide.call(this);
                    });

                    settings.afterLoad.call(this);
                });
            }

        }

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method "' + method + '" does not exist in dropit plugin!');
        }

    }

    $.fn.dropit.defaults = {
        action: 'click', // The open action for the trigger
        submenuEl: 'ul', // The submenu element
        triggerEl: 'a', // The trigger element
        triggerParentEl: 'li', // The trigger parent element
        afterLoad: function() {}, // Triggers when plugin has loaded
        beforeShow: function() {}, // Triggers before submenu is shown
        afterShow: function() {}, // Triggers after submenu is shown
        beforeHide: function() {}, // Triggers before submenu is hidden
        afterHide: function() {} // Triggers before submenu is hidden
    }

    $.fn.dropit.settings = {}

})(jQuery);;/*global jQuery */
/*jshint multistr:true browser:true */
/*!
* FitVids 1.0
*
* Copyright 2011, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {

      var div = document.createElement('div'),
          ref = document.getElementsByTagName('base')[0] || document.getElementsByTagName('script')[0];

      div.className = 'fit-vids-style';
      div.id = 'fit-vids-style';
      div.style.display = 'none';
      div.innerHTML = '&shy;<style>         \
        .fluid-width-video-wrapper {        \
           width: 100%;                     \
           position: relative;              \
           padding: 0;                      \
        }                                   \
                                            \
        .fluid-width-video-wrapper iframe,  \
        .fluid-width-video-wrapper object,  \
        .fluid-width-video-wrapper embed {  \
           position: absolute;              \
           top: 0;                          \
           left: 0;                         \
           width: 100%;                     \
           height: 100%;                    \
        }                                   \
      </style>';

      ref.parentNode.insertBefore(div,ref);

    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
})( jQuery );
;/*!
 * Fotorama 4.5.1 | http://fotorama.io/license/
 */
! function(a, b, c, d, e) {
    "use strict";

    function f(a) {
        var b = "bez_" + d.makeArray(arguments).join("_").replace(".", "p");
        if ("function" != typeof d.easing[b]) {
            var c = function(a, b) {
                var c = [null, null],
                    d = [null, null],
                    e = [null, null],
                    f = function(f, g) {
                        return e[g] = 3 * a[g], d[g] = 3 * (b[g] - a[g]) - e[g], c[g] = 1 - e[g] - d[g], f * (e[g] + f * (d[g] + f * c[g]))
                    }, g = function(a) {
                        return e[0] + a * (2 * d[0] + 3 * c[0] * a)
                    }, h = function(a) {
                        for (var b, c = a, d = 0; ++d < 14 && (b = f(c, 0) - a, !(Math.abs(b) < .001));) c -= b / g(c);
                        return c
                    };
                return function(a) {
                    return f(h(a), 1)
                }
            };
            d.easing[b] = function(b, d, e, f, g) {
                return f * c([a[0], a[1]], [a[2], a[3]])(d / g) + e
            }
        }
        return b
    }

    function g() {}

    function h(a, b, c) {
        return Math.max(isNaN(b) ? -1 / 0 : b, Math.min(isNaN(c) ? 1 / 0 : c, a))
    }

    function i(a) {
        return a.match(/ma/) && a.match(/-?\d+(?!d)/g)[a.match(/3d/) ? 12 : 4]
    }

    function j(a) {
        return Ec ? +i(a.css("transform")) : +a.css("left").replace("px", "")
    }

    function k(a, b) {
        var c = {};
        return Ec ? c.transform = "translate3d(" + (a + (b ? .001 : 0)) + "px,0,0)" : c.left = a, c
    }

    function l(a) {
        return {
            "transition-duration": a + "ms"
        }
    }

    function m(a, b) {
        return +String(a).replace(b || "px", "") || e
    }

    function n(a) {
        return /%$/.test(a) && m(a, "%")
    }

    function o(a, b) {
        return n(a) / 100 * b || m(a)
    }

    function p(a) {
        return ( !! m(a) || !! m(a, "%")) && a
    }

    function q(a, b, c, d) {
        return (a - (d || 0)) * (b + (c || 0))
    }

    function r(a, b, c, d) {
        return -Math.round(a / (b + (c || 0)) - (d || 0))
    }

    function s(a) {
        var b = a.data();
        if (!b.tEnd) {
            var c = a[0],
                d = {
                    WebkitTransition: "webkitTransitionEnd",
                    MozTransition: "transitionend",
                    OTransition: "oTransitionEnd otransitionend",
                    msTransition: "MSTransitionEnd",
                    transition: "transitionend"
                };
            c.addEventListener(d[mc.prefixed("transition")], function(a) {
                b.tProp && a.propertyName.match(b.tProp) && b.onEndFn()
            }, !1), b.tEnd = !0
        }
    }

    function t(a, b, c, d) {
        var e, f = a.data();
        f && (f.onEndFn = function() {
            e || (e = !0, clearTimeout(f.tT), c())
        }, f.tProp = b, clearTimeout(f.tT), f.tT = setTimeout(function() {
            f.onEndFn()
        }, 1.5 * d), s(a))
    }

    function u(a, b, c) {
        if (a.length) {
            var d = a.data();
            Ec ? (a.css(l(0)), d.onEndFn = g, clearTimeout(d.tT)) : a.stop();
            var e = v(b, function() {
                return j(a)
            });
            return a.css(k(e, c)), e
        }
    }

    function v() {
        for (var a, b = 0, c = arguments.length; c > b && (a = b ? arguments[b]() : arguments[b], "number" != typeof a); b++);
        return a
    }

    function w(a, b) {
        return Math.round(a + (b - a) / 1.5)
    }

    function x() {
        return x.p = x.p || ("https:" === c.protocol ? "https://" : "http://"), x.p
    }

    function y(a) {
        var c = b.createElement("a");
        return c.href = a, c
    }

    function z(a, b) {
        if ("string" != typeof a) return a;
        a = y(a);
        var c, d;
        if (a.host.match(/youtube\.com/) && a.search) {
            if (c = a.search.split("v=")[1]) {
                var e = c.indexOf("&"); - 1 !== e && (c = c.substring(0, e)), d = "youtube"
            }
        } else a.host.match(/youtube\.com|youtu\.be/) ? (c = a.pathname.replace(/^\/(embed\/|v\/)?/, "").replace(/\/.*/, ""), d = "youtube") : a.host.match(/vimeo\.com/) && (d = "vimeo", c = a.pathname.replace(/^\/(video\/)?/, "").replace(/\/.*/, ""));
        return c && d || !b || (c = a.href, d = "custom"), c ? {
            id: c,
            type: d,
            s: a.search.replace(/^\?/, "")
        } : !1
    }

    function A(a, b, c) {
        var e, f, g = a.video;
        return "youtube" === g.type ? (f = x() + "img.youtube.com/vi/" + g.id + "/default.jpg", e = f.replace(/\/default.jpg$/, "/hqdefault.jpg"), a.thumbsReady = !0) : "vimeo" === g.type ? d.ajax({
            url: x() + "vimeo.com/api/v2/video/" + g.id + ".json",
            dataType: "jsonp",
            success: function(d) {
                a.thumbsReady = !0, B(b, {
                    img: d[0].thumbnail_large,
                    thumb: d[0].thumbnail_small
                }, a.i, c)
            }
        }) : a.thumbsReady = !0, {
            img: e,
            thumb: f
        }
    }

    function B(a, b, c, e) {
        for (var f = 0, g = a.length; g > f; f++) {
            var h = a[f];
            if (h.i === c && h.thumbsReady) {
                var i = {
                    videoReady: !0
                };
                i[Uc] = i[Wc] = i[Vc] = !1, e.splice(f, 1, d.extend({}, h, i, b));
                break
            }
        }
    }

    function C(a) {
        function b(a, b, e) {
            var f = a.children("img").eq(0),
                g = a.attr("href"),
                h = a.attr("src"),
                i = f.attr("src"),
                j = b.video,
                k = e ? z(g, j === !0) : !1;
            k ? g = !1 : k = j, c(a, f, d.extend(b, {
                video: k,
                img: b.img || g || h || i,
                thumb: b.thumb || i || h || g
            }))
        }

        function c(a, b, c) {
            var e = c.thumb && c.img !== c.thumb,
                f = m(c.width || a.attr("width")),
                g = m(c.height || a.attr("height"));
            d.extend(c, {
                width: f,
                height: g,
                thumbratio: R(c.thumbratio || m(c.thumbwidth || b && b.attr("width") || e || f) / m(c.thumbheight || b && b.attr("height") || e || g))
            })
        }
        var e = [];
        return a.children().each(function() {
            var a = d(this),
                f = Q(d.extend(a.data(), {
                    id: a.attr("id")
                }));
            if (a.is("a, img")) b(a, f, !0);
            else {
                if (a.is(":empty")) return;
                c(a, null, d.extend(f, {
                    html: this,
                    _html: a.html()
                }))
            }
            e.push(f)
        }), e
    }

    function D(a) {
        return 0 === a.offsetWidth && 0 === a.offsetHeight
    }

    function E(a) {
        return !d.contains(b.documentElement, a)
    }

    function F(a, b, c) {
        a() ? b() : setTimeout(function() {
            F(a, b)
        }, c || 100)
    }

    function G(a) {
        c.replace(c.protocol + "//" + c.host + c.pathname.replace(/^\/?/, "/") + c.search + "#" + a)
    }

    function H(a, b, c) {
        var d = a.data(),
            e = d.measures;
        if (e && (!d.l || d.l.W !== e.width || d.l.H !== e.height || d.l.r !== e.ratio || d.l.w !== b.w || d.l.h !== b.h || d.l.m !== c)) {
            var f = e.width,
                g = e.height,
                i = b.w / b.h,
                j = e.ratio >= i,
                k = "scaledown" === c,
                l = "contain" === c,
                m = "cover" === c;
            j && (k || l) || !j && m ? (f = h(b.w, 0, k ? f : 1 / 0), g = f / e.ratio) : (j && m || !j && (k || l)) && (g = h(b.h, 0, k ? g : 1 / 0), f = g * e.ratio), a.css({
                width: Math.ceil(f),
                height: Math.ceil(g),
                marginLeft: Math.floor(-f / 2),
                marginTop: Math.floor(-g / 2)
            }), d.l = {
                W: e.width,
                H: e.height,
                r: e.ratio,
                w: b.w,
                h: b.h,
                m: c
            }
        }
        return !0
    }

    function I(a, b) {
        var c = a[0];
        c.styleSheet ? c.styleSheet.cssText = b : a.html(b)
    }

    function J(a, b, c) {
        return b === c ? !1 : b >= a ? "left" : a >= c ? "right" : "left right"
    }

    function K(a, b, c, d) {
        if (!c) return !1;
        if (!isNaN(a)) return a - (d ? 0 : 1);
        for (var e, f = 0, g = b.length; g > f; f++) {
            var h = b[f];
            if (h.id === a) {
                e = f;
                break
            }
        }
        return e
    }

    function L(a, b, c) {
        c = c || {}, a.each(function() {
            var a, e = d(this),
                f = e.data();
            f.clickOn || (f.clickOn = !0, d.extend(X(e, {
                onStart: function(b) {
                    a = b, (c.onStart || g).call(this, b)
                },
                onMove: c.onMove || g,
                onTouchEnd: c.onTouchEnd || g,
                onEnd: function(c) {
                    c.moved || b.call(this, a)
                }
            }), {
                noMove: !0
            }))
        })
    }

    function M(a, b) {
        return '<div class="' + a + '">' + (b || "") + "</div>"
    }

    function N(a) {
        for (var b = a.length; b;) {
            var c = Math.floor(Math.random() * b--),
                d = a[b];
            a[b] = a[c], a[c] = d
        }
        return a
    }

    function O(a) {
        return "[object Array]" == Object.prototype.toString.call(a) && d.map(a, function(a) {
            return d.extend({}, a)
        })
    }

    function P(a, b) {
        Ac.scrollLeft(a).scrollTop(b)
    }

    function Q(a) {
        if (a) {
            var b = {};
            return d.each(a, function(a, c) {
                b[a.toLowerCase()] = c
            }), b
        }
    }

    function R(a) {
        if (a) {
            var b = +a;
            return isNaN(b) ? (b = a.split("/"), +b[0] / +b[1] || e) : b
        }
    }

    function S(a, b) {
        a.preventDefault(), b && a.stopPropagation()
    }

    function T(a) {
        return a ? ">" : "<"
    }

    function U(a, b) {
        var c = a.data(),
            e = Math.round(b.pos),
            f = function() {
                c.sliding = !1, (b.onEnd || g)()
            };
        "undefined" != typeof b.overPos && b.overPos !== b.pos && (e = b.overPos, f = function() {
            U(a, d.extend({}, b, {
                overPos: b.pos,
                time: Math.max(Nc, b.time / 2)
            }))
        });
        var h = d.extend(k(e, b._001), b.width && {
            width: b.width
        });
        c.sliding = !0, Ec ? (a.css(d.extend(l(b.time), h)), b.time > 10 ? t(a, "transform", f, b.time) : f()) : a.stop().animate(h, b.time, Xc, f)
    }

    function V(a, b, c, e, f, h) {
        var i = "undefined" != typeof h;
        if (i || (f.push(arguments), Array.prototype.push.call(arguments, f.length), !(f.length > 1))) {
            a = a || d(a), b = b || d(b);
            var j = a[0],
                k = b[0],
                l = "crossfade" === e.method,
                m = function() {
                    if (!m.done) {
                        m.done = !0;
                        var a = (i || f.shift()) && f.shift();
                        a && V.apply(this, a), (e.onEnd || g)( !! a)
                    }
                }, n = e.time / (h || 1);
            c.removeClass(Kb + " " + Jb), a.stop().addClass(Kb), b.stop().addClass(Jb), l && k && a.fadeTo(0, 0), a.fadeTo(l ? n : 0, 1, l && m), b.fadeTo(n, 0, m), j && l || k || m()
        }
    }

    function W(a) {
        var b = (a.touches || [])[0] || a;
        a._x = b.pageX, a._y = b.clientY, a._now = d.now()
    }

    function X(c, e) {
        function f(a) {
            return n = d(a.target), v.checked = q = r = t = !1, l || v.flow || a.touches && a.touches.length > 1 || a.which > 1 || wc && wc.type !== a.type && yc || (q = e.select && n.is(e.select, u)) ? q : (p = "touchstart" === a.type, r = n.is("a, a *", u), o = v.control, s = v.noMove || v.noSwipe || o ? 16 : v.snap ? 0 : 4, W(a), m = wc = a, xc = a.type.replace(/down|start/, "move").replace(/Down/, "Move"), (e.onStart || g).call(u, a, {
                control: o,
                $target: n
            }), l = v.flow = !0, void((!p || v.go) && S(a)))
        }

        function h(a) {
            if (a.touches && a.touches.length > 1 || Kc && !a.isPrimary || xc !== a.type || !l) return l && i(), void(e.onTouchEnd || g)();
            W(a);
            var b = Math.abs(a._x - m._x),
                c = Math.abs(a._y - m._y),
                d = b - c,
                f = (v.go || v.x || d >= 0) && !v.noSwipe,
                h = 0 > d;
            p && !v.checked ? (l = f) && S(a) : (S(a), (e.onMove || g).call(u, a, {
                touch: p
            })), !t && Math.sqrt(Math.pow(b, 2) + Math.pow(c, 2)) > s && (t = !0), v.checked = v.checked || f || h
        }

        function i(a) {
            (e.onTouchEnd || g)();
            var b = l;
            v.control = l = !1, b && (v.flow = !1), !b || r && !v.checked || (a && S(a), yc = !0, clearTimeout(zc), zc = setTimeout(function() {
                yc = !1
            }, 1e3), (e.onEnd || g).call(u, {
                moved: t,
                $target: n,
                control: o,
                touch: p,
                startEvent: m,
                aborted: !a || "MSPointerCancel" === a.type
            }))
        }

        function j() {
            v.flow || setTimeout(function() {
                v.flow = !0
            }, 10)
        }

        function k() {
            v.flow && setTimeout(function() {
                v.flow = !1
            }, Mc)
        }
        var l, m, n, o, p, q, r, s, t, u = c[0],
            v = {};
        return Kc ? (u[Jc]("MSPointerDown", f, !1), b[Jc]("MSPointerMove", h, !1), b[Jc]("MSPointerCancel", i, !1), b[Jc]("MSPointerUp", i, !1)) : (u[Jc] && (u[Jc]("touchstart", f, !1), u[Jc]("touchmove", h, !1), u[Jc]("touchend", i, !1), b[Jc]("touchstart", j, !1), b[Jc]("touchend", k, !1), b[Jc]("touchcancel", k, !1), a[Jc]("scroll", k, !1)), c.on("mousedown", f), Bc.on("mousemove", h).on("mouseup", i)), c.on("click", "a", function(a) {
            v.checked && S(a)
        }), v
    }

    function Y(a, b) {
        function c(c, d) {
            A = !0, j = l = c._x, q = c._now, p = [
                [q, j]
            ], m = n = D.noMove || d ? 0 : u(a, (b.getPos || g)(), b._001), (b.onStart || g).call(B, c)
        }

        function e(a, b) {
            s = D.min, t = D.max, v = D.snap, x = a.altKey, A = z = !1, y = b.control, y || C.sliding || c(a)
        }

        function f(d, e) {
            D.noSwipe || (A || c(d), l = d._x, p.push([d._now, l]), n = m - (j - l), o = J(n, s, t), s >= n ? n = w(n, s) : n >= t && (n = w(n, t)), D.noMove || (a.css(k(n, b._001)), z || (z = !0, e.touch || Kc || a.addClass(Zb)), (b.onMove || g).call(B, d, {
                pos: n,
                edge: o
            })))
        }

        function i(e) {
            if (!D.noSwipe || !e.moved) {
                A || c(e.startEvent, !0), e.touch || Kc || a.removeClass(Zb), r = d.now();
                for (var f, i, j, k, o, q, u, w, y, z = r - Mc, C = null, E = Nc, F = b.friction, G = p.length - 1; G >= 0; G--) {
                    if (f = p[G][0], i = Math.abs(f - z), null === C || j > i) C = f, k = p[G][1];
                    else if (C === z || i > j) break;
                    j = i
                }
                u = h(n, s, t);
                var H = k - l,
                    I = H >= 0,
                    J = r - C,
                    K = J > Mc,
                    L = !K && n !== m && u === n;
                v && (u = h(Math[L ? I ? "floor" : "ceil" : "round"](n / v) * v, s, t), s = t = u), L && (v || u === n) && (y = -(H / J), E *= h(Math.abs(y), b.timeLow, b.timeHigh), o = Math.round(n + y * E / F), v || (u = o), (!I && o > t || I && s > o) && (q = I ? s : t, w = o - q, v || (u = q), w = h(u + .03 * w, q - 50, q + 50), E = Math.abs((n - w) / (y / F)))), E *= x ? 10 : 1, (b.onEnd || g).call(B, d.extend(e, {
                    moved: e.moved || K && v,
                    pos: n,
                    newPos: u,
                    overPos: w,
                    time: E
                }))
            }
        }
        var j, l, m, n, o, p, q, r, s, t, v, x, y, z, A, B = a[0],
            C = a.data(),
            D = {};
        return D = d.extend(X(b.$wrap, {
            onStart: e,
            onMove: f,
            onTouchEnd: b.onTouchEnd,
            onEnd: i,
            select: b.select
        }), D)
    }

    function Z(a, b) {
        var c, e, f, h = a[0],
            i = {
                prevent: {}
            };
        return h[Jc] && h[Jc](Lc, function(a) {
            var h = a.wheelDeltaY || -1 * a.deltaY || 0,
                j = a.wheelDeltaX || -1 * a.deltaX || 0,
                k = Math.abs(j) > Math.abs(h),
                l = T(0 > j),
                m = e === l,
                n = d.now(),
                o = Mc > n - f;
            e = l, f = n, k && i.ok && (!i.prevent[l] || c) && (S(a, !0), c && m && o || (b.shift && (c = !0, clearTimeout(i.t), i.t = setTimeout(function() {
                c = !1
            }, Oc)), (b.onEnd || g)(a, b.shift ? l : j)))
        }, !1), i
    }

    function $() {
        d.each(d.Fotorama.instances, function(a, b) {
            b.index = a
        })
    }

    function _(a) {
        d.Fotorama.instances.push(a), $()
    }

    function ab(a) {
        d.Fotorama.instances.splice(a.index, 1), $()
    }
    var bb = "fotorama",
        cb = "fullscreen",
        db = bb + "__wrap",
        eb = db + "--css2",
        fb = db + "--css3",
        gb = db + "--video",
        hb = db + "--fade",
        ib = db + "--slide",
        jb = db + "--no-controls",
        kb = db + "--no-shadows",
        lb = db + "--pan-y",
        mb = db + "--rtl",
        nb = db + "--only-active",
        ob = db + "--no-captions",
        pb = db + "--toggle-arrows",
        qb = bb + "__stage",
        rb = qb + "__frame",
        sb = rb + "--video",
        tb = qb + "__shaft",
        ub = bb + "__grab",
        vb = bb + "__pointer",
        wb = bb + "__arr",
        xb = wb + "--disabled",
        yb = wb + "--prev",
        zb = wb + "--next",
        Ab = bb + "__nav",
        Bb = Ab + "-wrap",
        Cb = Ab + "__shaft",
        Db = Ab + "--dots",
        Eb = Ab + "--thumbs",
        Fb = Ab + "__frame",
        Gb = Fb + "--dot",
        Hb = Fb + "--thumb",
        Ib = bb + "__fade",
        Jb = Ib + "-front",
        Kb = Ib + "-rear",
        Lb = bb + "__shadow",
        Mb = Lb + "s",
        Nb = Mb + "--left",
        Ob = Mb + "--right",
        Pb = bb + "__active",
        Qb = bb + "__select",
        Rb = bb + "--hidden",
        Sb = bb + "--fullscreen",
        Tb = bb + "__fullscreen-icon",
        Ub = bb + "__error",
        Vb = bb + "__loading",
        Wb = bb + "__loaded",
        Xb = Wb + "--full",
        Yb = Wb + "--img",
        Zb = bb + "__grabbing",
        $b = bb + "__img",
        _b = $b + "--full",
        ac = bb + "__dot",
        bc = bb + "__thumb",
        cc = bc + "-border",
        dc = bb + "__html",
        ec = bb + "__video",
        fc = ec + "-play",
        gc = ec + "-close",
        hc = bb + "__caption",
        ic = bb + "__caption__wrap",
        jc = bb + "__spinner",
        kc = d && d.fn.jquery.split(".");
    if (!kc || kc[0] < 1 || 1 == kc[0] && kc[1] < 8) throw "Fotorama requires jQuery 1.8 or later and will not run without it.";
    var lc = {}, mc = function(a, b, c) {
            function d(a) {
                r.cssText = a
            }

            function e(a, b) {
                return typeof a === b
            }

            function f(a, b) {
                return !!~("" + a).indexOf(b)
            }

            function g(a, b) {
                for (var d in a) {
                    var e = a[d];
                    if (!f(e, "-") && r[e] !== c) return "pfx" == b ? e : !0
                }
                return !1
            }

            function h(a, b, d) {
                for (var f in a) {
                    var g = b[a[f]];
                    if (g !== c) return d === !1 ? a[f] : e(g, "function") ? g.bind(d || b) : g
                }
                return !1
            }

            function i(a, b, c) {
                var d = a.charAt(0).toUpperCase() + a.slice(1),
                    f = (a + " " + u.join(d + " ") + d).split(" ");
                return e(b, "string") || e(b, "undefined") ? g(f, b) : (f = (a + " " + v.join(d + " ") + d).split(" "), h(f, b, c))
            }
            var j, k, l, m = "2.6.2",
                n = {}, o = b.documentElement,
                p = "modernizr",
                q = b.createElement(p),
                r = q.style,
                s = ({}.toString, " -webkit- -moz- -o- -ms- ".split(" ")),
                t = "Webkit Moz O ms",
                u = t.split(" "),
                v = t.toLowerCase().split(" "),
                w = {}, x = [],
                y = x.slice,
                z = function(a, c, d, e) {
                    var f, g, h, i, j = b.createElement("div"),
                        k = b.body,
                        l = k || b.createElement("body");
                    if (parseInt(d, 10))
                        for (; d--;) h = b.createElement("div"), h.id = e ? e[d] : p + (d + 1), j.appendChild(h);
                    return f = ["&#173;", '<style id="s', p, '">', a, "</style>"].join(""), j.id = p, (k ? j : l).innerHTML += f, l.appendChild(j), k || (l.style.background = "", l.style.overflow = "hidden", i = o.style.overflow, o.style.overflow = "hidden", o.appendChild(l)), g = c(j, a), k ? j.parentNode.removeChild(j) : (l.parentNode.removeChild(l), o.style.overflow = i), !! g
                }, A = {}.hasOwnProperty;
            l = e(A, "undefined") || e(A.call, "undefined") ? function(a, b) {
                return b in a && e(a.constructor.prototype[b], "undefined")
            } : function(a, b) {
                return A.call(a, b)
            }, Function.prototype.bind || (Function.prototype.bind = function(a) {
                var b = this;
                if ("function" != typeof b) throw new TypeError;
                var c = y.call(arguments, 1),
                    d = function() {
                        if (this instanceof d) {
                            var e = function() {};
                            e.prototype = b.prototype;
                            var f = new e,
                                g = b.apply(f, c.concat(y.call(arguments)));
                            return Object(g) === g ? g : f
                        }
                        return b.apply(a, c.concat(y.call(arguments)))
                    };
                return d
            }), w.csstransforms3d = function() {
                var a = !! i("perspective");
                return a
            };
            for (var B in w) l(w, B) && (k = B.toLowerCase(), n[k] = w[B](), x.push((n[k] ? "" : "no-") + k));
            return n.addTest = function(a, b) {
                if ("object" == typeof a)
                    for (var d in a) l(a, d) && n.addTest(d, a[d]);
                else {
                    if (a = a.toLowerCase(), n[a] !== c) return n;
                    b = "function" == typeof b ? b() : b, "undefined" != typeof enableClasses && enableClasses && (o.className += " " + (b ? "" : "no-") + a), n[a] = b
                }
                return n
            }, d(""), q = j = null, n._version = m, n._prefixes = s, n._domPrefixes = v, n._cssomPrefixes = u, n.testProp = function(a) {
                return g([a])
            }, n.testAllProps = i, n.testStyles = z, n.prefixed = function(a, b, c) {
                return b ? i(a, b, c) : i(a, "pfx")
            }, n
        }(a, b),
        nc = {
            ok: !1,
            is: function() {
                return !1
            },
            request: function() {},
            cancel: function() {},
            event: "",
            prefix: ""
        }, oc = "webkit moz o ms khtml".split(" ");
    if ("undefined" != typeof b.cancelFullScreen) nc.ok = !0;
    else
        for (var pc = 0, qc = oc.length; qc > pc; pc++)
            if (nc.prefix = oc[pc], "undefined" != typeof b[nc.prefix + "CancelFullScreen"]) {
                nc.ok = !0;
                break
            } nc.ok && (nc.event = nc.prefix + "fullscreenchange", nc.is = function() {
        switch (this.prefix) {
            case "":
                return b.fullScreen;
            case "webkit":
                return b.webkitIsFullScreen;
            default:
                return b[this.prefix + "FullScreen"]
        }
    }, nc.request = function(a) {
        return "" === this.prefix ? a.requestFullScreen() : a[this.prefix + "RequestFullScreen"]()
    }, nc.cancel = function() {
        return "" === this.prefix ? b.cancelFullScreen() : b[this.prefix + "CancelFullScreen"]()
    });
    var rc, sc = {
            lines: 12,
            length: 5,
            width: 2,
            radius: 7,
            corners: 1,
            rotate: 15,
            color: "rgba(128, 128, 128, .75)",
            hwaccel: !0
        }, tc = {
            top: "auto",
            left: "auto",
            className: ""
        };
    ! function(a, b) {
        rc = b()
    }(this, function() {
        function a(a, c) {
            var d, e = b.createElement(a || "div");
            for (d in c) e[d] = c[d];
            return e
        }

        function c(a) {
            for (var b = 1, c = arguments.length; c > b; b++) a.appendChild(arguments[b]);
            return a
        }

        function d(a, b, c, d) {
            var e = ["opacity", b, ~~ (100 * a), c, d].join("-"),
                f = .01 + c / d * 100,
                g = Math.max(1 - (1 - a) / b * (100 - f), a),
                h = m.substring(0, m.indexOf("Animation")).toLowerCase(),
                i = h && "-" + h + "-" || "";
            return o[e] || (p.insertRule("@" + i + "keyframes " + e + "{0%{opacity:" + g + "}" + f + "%{opacity:" + a + "}" + (f + .01) + "%{opacity:1}" + (f + b) % 100 + "%{opacity:" + a + "}100%{opacity:" + g + "}}", p.cssRules.length), o[e] = 1), e
        }

        function f(a, b) {
            var c, d, f = a.style;
            for (b = b.charAt(0).toUpperCase() + b.slice(1), d = 0; d < n.length; d++)
                if (c = n[d] + b, f[c] !== e) return c;
            return f[b] !== e ? b : void 0
        }

        function g(a, b) {
            for (var c in b) a.style[f(a, c) || c] = b[c];
            return a
        }

        function h(a) {
            for (var b = 1; b < arguments.length; b++) {
                var c = arguments[b];
                for (var d in c) a[d] === e && (a[d] = c[d])
            }
            return a
        }

        function i(a) {
            for (var b = {
                x: a.offsetLeft,
                y: a.offsetTop
            }; a = a.offsetParent;) b.x += a.offsetLeft, b.y += a.offsetTop;
            return b
        }

        function j(a, b) {
            return "string" == typeof a ? a : a[b % a.length]
        }

        function k(a) {
            return "undefined" == typeof this ? new k(a) : void(this.opts = h(a || {}, k.defaults, q))
        }

        function l() {
            function b(b, c) {
                return a("<" + b + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', c)
            }
            p.addRule(".spin-vml", "behavior:url(#default#VML)"), k.prototype.lines = function(a, d) {
                function e() {
                    return g(b("group", {
                        coordsize: k + " " + k,
                        coordorigin: -i + " " + -i
                    }), {
                        width: k,
                        height: k
                    })
                }

                function f(a, f, h) {
                    c(m, c(g(e(), {
                        rotation: 360 / d.lines * a + "deg",
                        left: ~~f
                    }), c(g(b("roundrect", {
                        arcsize: d.corners
                    }), {
                        width: i,
                        height: d.width,
                        left: d.radius,
                        top: -d.width >> 1,
                        filter: h
                    }), b("fill", {
                        color: j(d.color, a),
                        opacity: d.opacity
                    }), b("stroke", {
                        opacity: 0
                    }))))
                }
                var h, i = d.length + d.width,
                    k = 2 * i,
                    l = 2 * -(d.width + d.length) + "px",
                    m = g(e(), {
                        position: "absolute",
                        top: l,
                        left: l
                    });
                if (d.shadow)
                    for (h = 1; h <= d.lines; h++) f(h, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
                for (h = 1; h <= d.lines; h++) f(h);
                return c(a, m)
            }, k.prototype.opacity = function(a, b, c, d) {
                var e = a.firstChild;
                d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c))
            }
        }
        var m, n = ["webkit", "Moz", "ms", "O"],
            o = {}, p = function() {
                var d = a("style", {
                    type: "text/css"
                });
                return c(b.getElementsByTagName("head")[0], d), d.sheet || d.styleSheet
            }(),
            q = {
                lines: 12,
                length: 7,
                width: 5,
                radius: 10,
                rotate: 0,
                corners: 1,
                color: "#000",
                direction: 1,
                speed: 1,
                trail: 100,
                opacity: .25,
                fps: 20,
                zIndex: 2e9,
                className: "spinner",
                top: "auto",
                left: "auto",
                position: "relative"
            };
        k.defaults = {}, h(k.prototype, {
            spin: function(b) {
                this.stop();
                var c, d, e = this,
                    f = e.opts,
                    h = e.el = g(a(0, {
                        className: f.className
                    }), {
                        position: f.position,
                        width: 0,
                        zIndex: f.zIndex
                    }),
                    j = f.radius + f.length + f.width;
                if (b && (b.insertBefore(h, b.firstChild || null), d = i(b), c = i(h), g(h, {
                    left: ("auto" == f.left ? d.x - c.x + (b.offsetWidth >> 1) : parseInt(f.left, 10) + j) + "px",
                    top: ("auto" == f.top ? d.y - c.y + (b.offsetHeight >> 1) : parseInt(f.top, 10) + j) + "px"
                })), h.setAttribute("role", "progressbar"), e.lines(h, e.opts), !m) {
                    var k, l = 0,
                        n = (f.lines - 1) * (1 - f.direction) / 2,
                        o = f.fps,
                        p = o / f.speed,
                        q = (1 - f.opacity) / (p * f.trail / 100),
                        r = p / f.lines;
                    ! function s() {
                        l++;
                        for (var a = 0; a < f.lines; a++) k = Math.max(1 - (l + (f.lines - a) * r) % p * q, f.opacity), e.opacity(h, a * f.direction + n, k, f);
                        e.timeout = e.el && setTimeout(s, ~~ (1e3 / o))
                    }()
                }
                return e
            },
            stop: function() {
                var a = this.el;
                return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), this.el = e), this
            },
            lines: function(b, e) {
                function f(b, c) {
                    return g(a(), {
                        position: "absolute",
                        width: e.length + e.width + "px",
                        height: e.width + "px",
                        background: b,
                        boxShadow: c,
                        transformOrigin: "left",
                        transform: "rotate(" + ~~(360 / e.lines * i + e.rotate) + "deg) translate(" + e.radius + "px,0)",
                        borderRadius: (e.corners * e.width >> 1) + "px"
                    })
                }
                for (var h, i = 0, k = (e.lines - 1) * (1 - e.direction) / 2; i < e.lines; i++) h = g(a(), {
                    position: "absolute",
                    top: 1 + ~(e.width / 2) + "px",
                    transform: e.hwaccel ? "translate3d(0,0,0)" : "",
                    opacity: e.opacity,
                    animation: m && d(e.opacity, e.trail, k + i * e.direction, e.lines) + " " + 1 / e.speed + "s linear infinite"
                }), e.shadow && c(h, g(f("#000", "0 0 4px #000"), {
                    top: "2px"
                })), c(b, c(h, f(j(e.color, i), "0 0 1px rgba(0,0,0,.1)")));
                return b
            },
            opacity: function(a, b, c) {
                b < a.childNodes.length && (a.childNodes[b].style.opacity = c)
            }
        });
        var r = g(a("group"), {
            behavior: "url(#default#VML)"
        });
        return !f(r, "transform") && r.adj ? l() : m = f(r, "animation"), k
    });
    var uc, vc, wc, xc, yc, zc, Ac = d(a),
        Bc = d(b),
        Cc = "quirks" === c.hash.replace("#", ""),
        Dc = mc.csstransforms3d,
        Ec = Dc && !Cc,
        Fc = Dc || "CSS1Compat" === b.compatMode,
        Gc = nc.ok,
        Hc = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i),
        Ic = !Ec || Hc,
        Jc = "addEventListener",
        Kc = navigator.msPointerEnabled,
        Lc = "onwheel" in b.createElement("div") ? "wheel" : b.onmousewheel !== e ? "mousewheel" : "DOMMouseScroll",
        Mc = 250,
        Nc = 300,
        Oc = 1400,
        Pc = 5e3,
        Qc = 2,
        Rc = 64,
        Sc = 500,
        Tc = 333,
        Uc = "$stageFrame",
        Vc = "$navDotFrame",
        Wc = "$navThumbFrame",
        Xc = f([.1, 0, .25, 1]),
        Yc = 99999,
        Zc = {
            width: null,
            minwidth: null,
            maxwidth: "100%",
            height: null,
            minheight: null,
            maxheight: null,
            ratio: null,
            margin: Qc,
            glimpse: 0,
            nav: "dots",
            navposition: "bottom",
            navwidth: null,
            thumbwidth: Rc,
            thumbheight: Rc,
            thumbmargin: Qc,
            thumbborderwidth: Qc,
            allowfullscreen: !1,
            fit: "contain",
            transition: "slide",
            clicktransition: null,
            transitionduration: Nc,
            captions: !0,
            hash: !1,
            startindex: 0,
            loop: !1,
            autoplay: !1,
            stopautoplayontouch: !0,
            keyboard: !1,
            arrows: !0,
            click: !0,
            swipe: !0,
            trackpad: !0,
            shuffle: !1,
            direction: "ltr",
            shadows: !0,
            spinner: null
        }, $c = {
            left: !0,
            right: !0,
            down: !1,
            up: !1,
            space: !1,
            home: !1,
            end: !1
        };
    jQuery.Fotorama = function(a, e) {
        function f() {
            d.each(pd, function(a, b) {
                if (!b.i) {
                    b.i = ce++;
                    var c = z(b.video, !0);
                    if (c) {
                        var d = {};
                        b.video = c, b.img || b.thumb ? b.thumbsReady = !0 : d = A(b, pd, $d), B(pd, {
                            img: d.img,
                            thumb: d.thumb
                        }, b.i, $d)
                    }
                }
            })
        }

        function g(a) {
            return Pd[a] || $d.fullScreen
        }

        function i(a) {
            var b = "keydown." + bb,
                c = "keydown." + bb + _d,
                d = "resize." + bb + _d;
            a ? (Bc.on(c, function(a) {
                var b, c;
                td && 27 === a.keyCode ? (b = !0, fd(td, !0, !0)) : ($d.fullScreen || e.keyboard && !$d.index) && (27 === a.keyCode ? (b = !0, $d.cancelFullScreen()) : a.shiftKey && 32 === a.keyCode && g("space") || 37 === a.keyCode && g("left") || 38 === a.keyCode && g("up") ? c = "<" : 32 === a.keyCode && g("space") || 39 === a.keyCode && g("right") || 40 === a.keyCode && g("down") ? c = ">" : 36 === a.keyCode && g("home") ? c = "<<" : 35 === a.keyCode && g("end") && (c = ">>")), (b || c) && S(a), c && $d.show({
                    index: c,
                    slow: a.altKey,
                    user: !0
                })
            }), $d.index || Bc.off(b).on(b, "textarea, input, select", function(a) {
                !vc.hasClass(cb) && a.stopPropagation()
            }), Ac.on(d, $d.resize)) : (Bc.off(c), Ac.off(d))
        }

        function j(b) {
            b !== j.f && (b ? (a.html("").addClass(bb + " " + ae).append(ge).before(ee).before(fe), _($d)) : (ge.detach(), ee.detach(), fe.detach(), a.html(de.urtext).removeClass(ae), ab($d)), i(b), j.f = b)
        }

        function n() {
            pd = $d.data = pd || O(e.data) || C(a), qd = $d.size = pd.length, !od.ok && e.shuffle && N(pd), f(), ze = y(ze), qd && j(!0)
        }

        function s() {
            var a = 2 > qd || td;
            Ce.noMove = a || Id, Ce.noSwipe = a || !e.swipe, !Md && ie.toggleClass(ub, !Ce.noMove && !Ce.noSwipe), Kc && ge.toggleClass(lb, !Ce.noSwipe)
        }

        function t(a) {
            a === !0 && (a = ""), e.autoplay = Math.max(+a || Pc, 1.5 * Ld)
        }

        function w() {
            function a(a, c) {
                b[a ? "add" : "remove"].push(c)
            }
            $d.options = e = Q(e), Id = "crossfade" === e.transition || "dissolve" === e.transition, Cd = e.loop && (qd > 2 || Id) && (!Md || "slide" !== Md), Ld = +e.transitionduration || Nc, Od = "rtl" === e.direction, Pd = d.extend({}, e.keyboard && $c, e.keyboard);
            var b = {
                add: [],
                remove: []
            };
            qd > 1 ? (Dd = e.nav, Fd = "top" === e.navposition, b.remove.push(Qb), me.toggle( !! e.arrows)) : (Dd = !1, me.hide()), ec(), sd = new rc(d.extend(sc, e.spinner, tc, {
                direction: Od ? -1 : 1
            })), yc(), zc(), e.autoplay && t(e.autoplay), Jd = m(e.thumbwidth) || Rc, Kd = m(e.thumbheight) || Rc, De.ok = Fe.ok = e.trackpad && !Ic, s(), Xc(e, [Be]), Ed = "thumbs" === Dd, Ed ? (lc(qd, "navThumb"), rd = re, Zd = Wc, I(ee, d.Fotorama.jst.style({
                w: Jd,
                h: Kd,
                b: e.thumbborderwidth,
                m: e.thumbmargin,
                s: _d,
                q: !Fc
            })), oe.addClass(Eb).removeClass(Db)) : "dots" === Dd ? (lc(qd, "navDot"), rd = qe, Zd = Vc, oe.addClass(Db).removeClass(Eb)) : (Dd = !1, oe.removeClass(Eb + " " + Db)), Dd && (Fd ? ne.insertBefore(he) : ne.insertAfter(he), qc.nav = !1, qc(rd, pe, "nav")), Gd = e.allowfullscreen, Gd ? (te.appendTo(he), Hd = Gc && "native" === Gd) : (te.detach(), Hd = !1), a(Id, hb), a(!Id, ib), a(!e.captions, ob), a(Od, mb), a("always" !== e.arrows, pb), Nd = e.shadows && !Ic, a(!Nd, kb), ge.addClass(b.add.join(" ")).removeClass(b.remove.join(" ")), Ae = d.extend({}, e)
        }

        function x(a) {
            return 0 > a ? (qd + a % qd) % qd : a >= qd ? a % qd : a
        }

        function y(a) {
            return h(a, 0, qd - 1)
        }

        function D(a) {
            return Cd ? x(a) : y(a)
        }

        function W(a) {
            return a > 0 || Cd ? a - 1 : !1
        }

        function X(a) {
            return qd - 1 > a || Cd ? a + 1 : !1
        }

        function $() {
            Ce.min = Cd ? -1 / 0 : -q(qd - 1, Be.w, e.margin, wd), Ce.max = Cd ? 1 / 0 : -q(0, Be.w, e.margin, wd), Ce.snap = Be.w + e.margin
        }

        function Ib() {
            Ee.min = Math.min(0, Be.nw - pe.width()), Ee.max = 0, pe.toggleClass(ub, !(Ee.noMove = Ee.min === Ee.max))
        }

        function Jb(a, b, c) {
            if ("number" == typeof a) {
                a = new Array(a);
                var e = !0
            }
            return d.each(a, function(a, d) {
                if (e && (d = a), "number" == typeof d) {
                    var f = pd[x(d)];
                    if (f) {
                        var g = "$" + b + "Frame",
                            h = f[g];
                        c.call(this, a, d, f, h, g, h && h.data())
                    }
                }
            })
        }

        function Kb(a, b, c, d) {
            (!Qd || "*" === Qd && d === Bd) && (a = p(e.width) || p(a) || Sc, b = p(e.height) || p(b) || Tc, $d.resize({
                width: a,
                ratio: e.ratio || c || a / b
            }, 0, d === Bd ? !0 : "*"))
        }

        function Lb(a, b, c, f, g) {
            Jb(a, b, function(a, h, i, j, k, l) {
                function m(a) {
                    var b = x(h);
                    Zc(a, {
                        index: b,
                        src: v,
                        frame: pd[b]
                    })
                }

                function n() {
                    s.remove(), d.Fotorama.cache[v] = "error", i.html && "stage" === b || !w || w === v ? (!v || i.html || q ? "stage" === b && (j.trigger("f:load").removeClass(Vb + " " + Ub).addClass(Wb), m("load"), Kb()) : (j.trigger("f:error").removeClass(Vb).addClass(Ub), m("error")), l.state = "error", !(qd > 1 && pd[h] === i) || i.html || i.deleted || i.video || q || (i.deleted = !0, $d.splice(h, 1))) : (i[u] = v = w, Lb([h], b, c, f, !0))
                }

                function o() {
                    d.Fotorama.measures[v] = t.measures = d.Fotorama.measures[v] || {
                        width: r.width,
                        height: r.height,
                        ratio: r.width / r.height
                    }, Kb(t.measures.width, t.measures.height, t.measures.ratio, h), s.off("load error").addClass($b + (q ? " " + _b : "")).prependTo(j), H(s, c || Be, f || i.fit || e.fit), d.Fotorama.cache[v] = l.state = "loaded", setTimeout(function() {
                        j.trigger("f:load").removeClass(Vb + " " + Ub).addClass(Wb + " " + (q ? Xb : Yb)), "stage" === b && m("load")
                    }, 5)
                }

                function p() {
                    var a = 10;
                    F(function() {
                        return !Xd || !a-- && !Ic
                    }, function() {
                        o()
                    })
                }
                if (j) {
                    var q = $d.fullScreen && i.full && i.full !== i.img && !l.$full && "stage" === b;
                    if (!l.$img || g || q) {
                        var r = new Image,
                            s = d(r),
                            t = s.data();
                        l[q ? "$full" : "$img"] = s;
                        var u = "stage" === b ? q ? "full" : "img" : "thumb",
                            v = i[u],
                            w = q ? null : i["stage" === b ? "thumb" : "img"];
                        if ("navThumb" === b && (j = l.$wrap), !v) return void n();
                        d.Fotorama.cache[v] ? ! function y() {
                            "error" === d.Fotorama.cache[v] ? n() : "loaded" === d.Fotorama.cache[v] ? setTimeout(p, 0) : setTimeout(y, 100)
                        }() : (d.Fotorama.cache[v] = "*", s.on("load", p).on("error", n)), l.state = "", r.src = v
                    }
                }
            })
        }

        function Zb(a) {
            ye.append(sd.spin().el).appendTo(a)
        }

        function ec() {
            ye.detach(), sd && sd.stop()
        }

        function kc() {
            var a = $d.activeFrame[Uc];
            a && !a.data().state && (Zb(a), a.on("f:load f:error", function() {
                a.off("f:load f:error"), ec()
            }))
        }

        function lc(a, b) {
            Jb(a, b, function(a, c, f, g, h, i) {
                g || (g = f[h] = ge[h].clone(), i = g.data(), i.data = f, "stage" === b ? (f.html && d('<div class="' + dc + '"></div>').append(f._html ? d(f.html).removeAttr("id").html(f._html) : f.html).appendTo(g), e.captions && f.caption && d(M(hc, M(ic, f.caption))).appendTo(g), f.video && g.addClass(sb).append(ve.clone()), je = je.add(g)) : "navDot" === b ? qe = qe.add(g) : "navThumb" === b && (i.$wrap = g.children(":first"), re = re.add(g), f.video && g.append(ve.clone())))
            })
        }

        function mc(a, b, c) {
            return a && a.length && H(a, b, c)
        }

        function oc(a) {
            Jb(a, "stage", function(a, b, c, f, g, h) {
                if (f) {
                    He[Uc][x(b)] = f.css(d.extend({
                        left: Id ? 0 : q(b, Be.w, e.margin, wd)
                    }, Id && l(0))), E(f[0]) && (f.appendTo(ie), fd(c.$video));
                    var i = c.fit || e.fit;
                    mc(h.$img, Be, i), mc(h.$full, Be, i)
                }
            })
        }

        function pc(a, b) {
            if ("thumbs" === Dd && !isNaN(a)) {
                var c = -a,
                    e = -a + Be.nw;
                re.each(function() {
                    var a = d(this),
                        f = a.data(),
                        g = f.eq,
                        h = {
                            h: Kd
                        }, i = "cover";
                    h.w = f.w, f.l + f.w < c || f.l > e || mc(f.$img, h, i) || b && Lb([g], "navThumb", h, i)
                })
            }
        }

        function qc(a, b, c) {
            if (!qc[c]) {
                var f = "nav" === c && Ed,
                    g = 0;
                b.append(a.filter(function() {
                    for (var a, b = d(this), c = b.data(), e = 0, f = pd.length; f > e; e++)
                        if (c.data === pd[e]) {
                            a = !0, c.eq = e;
                            break
                        }
                    return a || b.remove() && !1
                }).sort(function(a, b) {
                    return d(a).data().eq - d(b).data().eq
                }).each(function() {
                    if (f) {
                        var a = d(this),
                            b = a.data(),
                            c = Math.round(Kd * b.data.thumbratio) || Jd;
                        b.l = g, b.w = c, a.css({
                            width: c
                        }), g += c + e.thumbmargin
                    }
                })), qc[c] = !0
            }
        }

        function wc(a) {
            return a - Ie > Be.w / 3
        }

        function xc(a) {
            return !(Cd || ze + a && ze - qd + a || td)
        }

        function yc() {
            ke.toggleClass(xb, xc(0)), le.toggleClass(xb, xc(1))
        }

        function zc() {
            De.ok && (De.prevent = {
                "<": xc(0),
                ">": xc(1)
            })
        }

        function Cc(a) {
            var b, c, d = a.data();
            return Ed ? (b = d.l, c = d.w) : (b = a.position().left, c = a.width()), {
                c: b + c / 2,
                min: -b + 10 * e.thumbmargin,
                max: -b + Be.w - c - 10 * e.thumbmargin
            }
        }

        function Dc(a) {
            var b = $d.activeFrame[Zd].data();
            U(se, {
                time: .9 * a,
                pos: b.l,
                width: b.w - 2 * e.thumbborderwidth
            })
        }

        function Hc(a) {
            var b = pd[a.guessIndex][Zd];
            if (b) {
                var c = Ee.min !== Ee.max,
                    d = c && Cc($d.activeFrame[Zd]),
                    e = c && (a.keep && Hc.l ? Hc.l : h((a.coo || Be.nw / 2) - Cc(b).c, d.min, d.max)),
                    f = c && h(e, Ee.min, Ee.max),
                    g = .9 * a.time;
                U(pe, {
                    time: g,
                    pos: f || 0,
                    onEnd: function() {
                        pc(f, !0)
                    }
                }), ed(oe, J(f, Ee.min, Ee.max)), Hc.l = e
            }
        }

        function Jc() {
            Lc(Zd), Ge[Zd].push($d.activeFrame[Zd].addClass(Pb))
        }

        function Lc(a) {
            for (var b = Ge[a]; b.length;) b.shift().removeClass(Pb)
        }

        function Oc(a) {
            var b = He[a];
            d.each(vd, function(a, c) {
                delete b[x(c)]
            }), d.each(b, function(a, c) {
                delete b[a], c.detach()
            })
        }

        function Qc(a) {
            wd = xd = ze;
            var b = $d.activeFrame,
                c = b[Uc];
            c && (Lc(Uc), Ge[Uc].push(c.addClass(Pb)), a || $d.show.onEnd(!0), u(ie, 0, !0), Oc(Uc), oc(vd), $(), Ib())
        }

        function Xc(a, b) {
            a && d.each(b, function(b, c) {
                c && d.extend(c, {
                    width: a.width || c.width,
                    height: a.height,
                    minwidth: a.minwidth,
                    maxwidth: a.maxwidth,
                    minheight: a.minheight,
                    maxheight: a.maxheight,
                    ratio: R(a.ratio)
                })
            })
        }

        function Zc(b, c) {
            a.trigger(bb + ":" + b, [$d, c])
        }

        function _c() {
            clearTimeout(ad.t), Xd = 1, e.stopautoplayontouch ? $d.stopAutoplay() : Ud = !0
        }

        function ad() {
            e.stopautoplayontouch || (bd(), cd()), ad.t = setTimeout(function() {
                Xd = 0
            }, Nc + Mc)
        }

        function bd() {
            Ud = !(!td && !Vd)
        }

        function cd() {
            if (clearTimeout(cd.t), !e.autoplay || Ud) return void($d.autoplay && ($d.autoplay = !1, Zc("stopautoplay")));
            $d.autoplay || ($d.autoplay = !0, Zc("startautoplay"));
            var a = ze,
                b = $d.activeFrame[Uc].data();
            F(function() {
                return b.state || a !== ze
            }, function() {
                cd.t = setTimeout(function() {
                    Ud || a !== ze || $d.show(Cd ? T(!Od) : x(ze + (Od ? -1 : 1)))
                }, e.autoplay)
            })
        }

        function dd() {
            $d.fullScreen && ($d.fullScreen = !1, Gc && nc.cancel(be), vc.removeClass(cb), uc.removeClass(cb), a.removeClass(Sb).insertAfter(fe), Be = d.extend({}, Wd), fd(td, !0, !0), kd("x", !1), $d.resize(), Lb(vd, "stage"), P(Sd, Rd), Zc("fullscreenexit"))
        }

        function ed(a, b) {
            Nd && (a.removeClass(Nb + " " + Ob), b && !td && a.addClass(b.replace(/^|\s/g, " " + Mb + "--")))
        }

        function fd(a, b, c) {
            b && (ge.removeClass(gb), td = !1, s()), a && a !== td && (a.remove(), Zc("unloadvideo")), c && (bd(), cd())
        }

        function gd(a) {
            ge.toggleClass(jb, a)
        }

        function hd(a) {
            if (!Ce.flow) {
                var b = a ? a.pageX : hd.x,
                    c = b && !xc(wc(b)) && e.click;
                hd.p === c || !Id && e.swipe || !he.toggleClass(vb, c) || (hd.p = c, hd.x = b)
            }
        }

        function id(a) {
            clearTimeout(id.t), e.clicktransition && e.clicktransition !== e.transition ? (Md = e.transition, $d.setOptions({
                transition: e.clicktransition
            }), id.t = setTimeout(function() {
                $d.show(a)
            }, 10)) : $d.show(a)
        }

        function jd(a, b) {
            var c = a.target,
                f = d(c);
            f.hasClass(fc) ? $d.playVideo() : c === ue ? $d[($d.fullScreen ? "cancel" : "request") + "FullScreen"]() : td ? c === xe && fd(td, !0, !0) : b ? gd() : e.click && id({
                index: a.shiftKey || T(wc(a._x)),
                slow: a.altKey,
                user: !0
            })
        }

        function kd(a, b) {
            Ce[a] = Ee[a] = b
        }

        function ld(a, b) {
            var c = d(this).data().eq;
            id({
                index: c,
                slow: a.altKey,
                user: !0,
                coo: a._x - oe.offset().left,
                time: b
            })
        }

        function md() {
            if (n(), w(), !md.i) {
                md.i = !0;
                var a = e.startindex;
                (a || e.hash && c.hash) && (Bd = K(a || c.hash.replace(/^#/, ""), pd, 0 === $d.index || a, a)), ze = wd = xd = yd = Bd = D(Bd) || 0
            }
            if (qd) {
                if (nd()) return;
                td && fd(td, !0), vd = [], Oc(Uc), $d.show({
                    index: ze,
                    time: 0,
                    reset: md.ok
                }), $d.resize()
            } else $d.destroy();
            md.ok = !0
        }

        function nd() {
            return !nd.f === Od ? (nd.f = Od, ze = qd - 1 - ze, $d.reverse(), !0) : void 0
        }

        function od() {
            od.ok || (od.ok = !0, Zc("ready"))
        }
        uc = uc || d("html"), vc = vc || d("body");
        var pd, qd, rd, sd, td, ud, vd, wd, xd, yd, zd, Ad, Bd, Cd, Dd, Ed, Fd, Gd, Hd, Id, Jd, Kd, Ld, Md, Nd, Od, Pd, Qd, Rd, Sd, Td, Ud, Vd, Wd, Xd, Yd, Zd, $d = this,
            _d = d.now(),
            ae = bb + _d,
            be = a[0],
            ce = 1,
            de = a.data(),
            ee = d("<style></style>"),
            fe = d(M(Rb)),
            ge = d(M(db)),
            he = d(M(qb)).appendTo(ge),
            ie = (he[0], d(M(tb)).appendTo(he)),
            je = d(),
            ke = d(M(wb + " " + yb)),
            le = d(M(wb + " " + zb)),
            me = ke.add(le).appendTo(he),
            ne = d(M(Bb)),
            oe = d(M(Ab)).appendTo(ne),
            pe = d(M(Cb)).appendTo(oe),
            qe = d(),
            re = d(),
            se = (ie.data(), pe.data(), d(M(cc)).appendTo(pe)),
            te = d(M(Tb)),
            ue = te[0],
            ve = d(M(fc)),
            we = d(M(gc)).appendTo(he),
            xe = we[0],
            ye = d(M(jc)),
            ze = !1,
            Ae = {}, Be = {}, Ce = {}, De = {}, Ee = {}, Fe = {}, Ge = {}, He = {}, Ie = 0,
            Je = [];
        ge[Uc] = d(M(rb)), ge[Wc] = d(M(Fb + " " + Hb, M(bc))), ge[Vc] = d(M(Fb + " " + Gb, M(ac))), Ge[Uc] = [], Ge[Wc] = [], Ge[Vc] = [], He[Uc] = {}, ge.addClass(Ec ? fb : eb), de.fotorama = this, $d.startAutoplay = function(a) {
            return $d.autoplay ? this : (Ud = Vd = !1, t(a || e.autoplay), cd(), this)
        }, $d.stopAutoplay = function() {
            return $d.autoplay && (Ud = Vd = !0, cd()), this
        }, $d.show = function(a) {
            var b;
            "object" != typeof a ? (b = a, a = {}) : b = a.index, b = ">" === b ? xd + 1 : "<" === b ? xd - 1 : "<<" === b ? 0 : ">>" === b ? qd - 1 : b, b = isNaN(b) ? K(b, pd, !0) : b, b = "undefined" == typeof b ? ze || 0 : b, $d.activeIndex = ze = D(b), zd = W(ze), Ad = X(ze), vd = [ze, zd, Ad], xd = Cd ? b : ze;
            var c = Math.abs(yd - xd),
                d = v(a.time, function() {
                    return Math.min(Ld * (1 + (c - 1) / 12), 2 * Ld)
                }),
                f = a.overPos;
            a.slow && (d *= 10), $d.activeFrame = ud = pd[ze], fd(td, ud.i !== pd[x(wd)].i), lc(vd, "stage"), oc(Ic ? [xd] : [xd, W(xd), X(xd)]), kd("go", !0), a.reset || Zc("show", {
                user: a.user,
                time: d
            }), Ud = !0;
            var g = $d.show.onEnd = function(b) {
                if (!g.ok) {
                    if (g.ok = !0, b || Qc(!0), !a.reset && (Zc("showend", {
                        user: a.user
                    }), !b && Md && Md !== e.transition)) return $d.setOptions({
                        transition: Md
                    }), void(Md = !1);
                    kc(), Lb(vd, "stage"), kd("go", !1), zc(), hd(), bd(), cd()
                }
            };
            if (Id) {
                var i = ud[Uc],
                    j = ze !== yd ? pd[yd][Uc] : null;
                V(i, j, je, {
                    time: d,
                    method: e.transition,
                    onEnd: g
                }, Je)
            } else U(ie, {
                pos: -q(xd, Be.w, e.margin, wd),
                overPos: f,
                time: d,
                onEnd: g,
                _001: !0
            }); if (yc(), Dd) {
                Jc();
                var k = y(ze + h(xd - yd, -1, 1));
                Hc({
                    time: d,
                    coo: k !== ze && a.coo,
                    guessIndex: "undefined" != typeof a.coo ? k : ze,
                    keep: a.reset
                }), Ed && Dc(d)
            }
            return Td = "undefined" != typeof yd && yd !== ze, yd = ze, e.hash && Td && !$d.eq && G(ud.id || ze + 1), this
        }, $d.requestFullScreen = function() {
            return Gd && !$d.fullScreen && (Rd = Ac.scrollTop(), Sd = Ac.scrollLeft(), P(0, 0), kd("x", !0), Wd = d.extend({}, Be), a.addClass(Sb).appendTo(vc.addClass(cb)), uc.addClass(cb), fd(td, !0, !0), $d.fullScreen = !0, Hd && nc.request(be), $d.resize(), Lb(vd, "stage"), kc(), Zc("fullscreenenter")), this
        }, $d.cancelFullScreen = function() {
            return Hd && nc.is() ? nc.cancel(b) : dd(), this
        }, b.addEventListener && b.addEventListener(nc.event, function() {
            !pd || nc.is() || td || dd()
        }, !1), $d.resize = function(a) {
            if (!pd) return this;
            Xc($d.fullScreen ? {
                width: "100%",
                maxwidth: null,
                minwidth: null,
                height: "100%",
                maxheight: null,
                minheight: null
            } : Q(a), [Be, $d.fullScreen || e]);
            var b = arguments[1] || 0,
                c = arguments[2],
                d = Be.width,
                f = Be.height,
                g = Be.ratio,
                i = Ac.height() - (Dd ? oe.height() : 0);
            return p(d) && (ge.addClass(nb).css({
                width: d,
                minWidth: Be.minwidth || 0,
                maxWidth: Be.maxwidth || Yc
            }), d = Be.W = Be.w = ge.width(), Be.nw = Dd && o(e.navwidth, d) || d, e.glimpse && (Be.w -= Math.round(2 * (o(e.glimpse, d) || 0))), ie.css({
                width: Be.w,
                marginLeft: (Be.W - Be.w) / 2
            }), f = o(f, i), f = f || g && d / g, f && (d = Math.round(d), f = Be.h = Math.round(h(f, o(Be.minheight, i), o(Be.maxheight, i))), he.stop().animate({
                width: d,
                height: f
            }, b, function() {
                ge.removeClass(nb)
            }), Qc(), Dd && (oe.stop().animate({
                width: Be.nw
            }, b), Hc({
                guessIndex: ze,
                time: b,
                keep: !0
            }), Ed && qc.nav && Dc(b)), Qd = c || !0, od())), Ie = he.offset().left, this
        }, $d.setOptions = function(a) {
            return d.extend(e, a), md(), this
        }, $d.shuffle = function() {
            return pd && N(pd) && md(), this
        }, $d.destroy = function() {
            return $d.cancelFullScreen(), $d.stopAutoplay(), pd = $d.data = null, j(), vd = [], Oc(Uc), this
        }, $d.playVideo = function() {
            var a = $d.activeFrame,
                b = a.video,
                c = ze;
            return "object" == typeof b && a.videoReady && (Hd && $d.fullScreen && $d.cancelFullScreen(), F(function() {
                return !nc.is() || c !== ze
            }, function() {
                c === ze && (a.$video = a.$video || d(d.Fotorama.jst.video(b)), a.$video.appendTo(a[Uc]), ge.addClass(gb), td = a.$video, s(), Zc("loadvideo"))
            })), this
        }, $d.stopVideo = function() {
            return fd(td, !0, !0), this
        }, he.on("mousemove", hd), Ce = Y(ie, {
            onStart: _c,
            onMove: function(a, b) {
                ed(he, b.edge)
            },
            onTouchEnd: ad,
            onEnd: function(a) {
                ed(he);
                var b = (Kc && !Yd || a.touch) && e.arrows && "always" !== e.arrows;
                if (a.moved || b && a.pos !== a.newPos && !a.control) {
                    var c = r(a.newPos, Be.w, e.margin, wd);
                    $d.show({
                        index: c,
                        time: Id ? Ld : a.time,
                        overPos: a.overPos,
                        user: !0
                    })
                } else a.aborted || a.control || jd(a.startEvent, b)
            },
            _001: !0,
            timeLow: 1,
            timeHigh: 1,
            friction: 2,
            select: "." + Qb + ", ." + Qb + " *",
            $wrap: he
        }), Ee = Y(pe, {
            onStart: _c,
            onMove: function(a, b) {
                ed(oe, b.edge)
            },
            onTouchEnd: ad,
            onEnd: function(a) {
                function b() {
                    Hc.l = a.newPos, bd(), cd(), pc(a.newPos, !0)
                }
                if (a.moved) a.pos !== a.newPos ? (Ud = !0, U(pe, {
                    time: a.time,
                    pos: a.newPos,
                    overPos: a.overPos,
                    onEnd: b
                }), pc(a.newPos), Nd && ed(oe, J(a.newPos, Ee.min, Ee.max))) : b();
                else {
                    var c = a.$target.closest("." + Fb, pe)[0];
                    c && ld.call(c, a.startEvent)
                }
            },
            timeLow: .5,
            timeHigh: 2,
            friction: 5,
            $wrap: oe
        }), De = Z(he, {
            shift: !0,
            onEnd: function(a, b) {
                _c(), ad(), $d.show({
                    index: b,
                    slow: a.altKey
                })
            }
        }), Fe = Z(oe, {
            onEnd: function(a, b) {
                _c(), ad();
                var c = u(pe) + .25 * b;
                pe.css(k(h(c, Ee.min, Ee.max))), Nd && ed(oe, J(c, Ee.min, Ee.max)), Fe.prevent = {
                    "<": c >= Ee.max,
                    ">": c <= Ee.min
                }, clearTimeout(Fe.t), Fe.t = setTimeout(function() {
                    pc(c, !0)
                }, Mc), pc(c)
            }
        }), ge.hover(function() {
            setTimeout(function() {
                Xd || (Yd = !0, gd(!Yd))
            }, 0)
        }, function() {
            Yd && (Yd = !1, gd(!Yd))
        }), L(me, function(a) {
            S(a), id({
                index: me.index(this) ? ">" : "<",
                slow: a.altKey,
                user: !0
            })
        }, {
            onStart: function() {
                _c(), Ce.control = !0
            },
            onTouchEnd: ad
        }), d.each("load push pop shift unshift reverse sort splice".split(" "), function(a, b) {
            $d[b] = function() {
                return pd = pd || [], "load" !== b ? Array.prototype[b].apply(pd, arguments) : arguments[0] && "object" == typeof arguments[0] && arguments[0].length && (pd = O(arguments[0])), md(), $d
            }
        }), md()
    }, d.fn.fotorama = function(b) {
        return this.each(function() {
            var c = this,
                e = d(this),
                f = e.data(),
                g = f.fotorama;
            g ? g.setOptions(b) : F(function() {
                return !D(c)
            }, function() {
                f.urtext = e.html(), new d.Fotorama(e, d.extend({}, Zc, a.fotoramaDefaults, b, f))
            })
        })
    }, d.Fotorama.instances = [], d.Fotorama.cache = {}, d.Fotorama.measures = {}, d = d || {}, d.Fotorama = d.Fotorama || {}, d.Fotorama.jst = d.Fotorama.jst || {}, d.Fotorama.jst.style = function(a) {
        {
            var b, c = "";
            lc.escape
        }
        return c += ".fotorama" + (null == (b = a.s) ? "" : b) + " .fotorama__nav--thumbs .fotorama__nav__frame{\npadding:" + (null == (b = a.m) ? "" : b) + "px;\nheight:" + (null == (b = a.h) ? "" : b) + "px}\n.fotorama" + (null == (b = a.s) ? "" : b) + " .fotorama__thumb-border{\nheight:" + (null == (b = a.h - a.b * (a.q ? 0 : 2)) ? "" : b) + "px;\nborder-width:" + (null == (b = a.b) ? "" : b) + "px;\nmargin-top:" + (null == (b = a.m) ? "" : b) + "px}"
    }, d.Fotorama.jst.video = function(a) {
        function b() {
            c += d.call(arguments, "")
        }
        var c = "",
            d = (lc.escape, Array.prototype.join);
        return c += '<div class="fotorama__video"><iframe src="', b(("youtube" == a.type ? "http://youtube.com/embed/" + a.id + "?autoplay=1" : "vimeo" == a.type ? "http://player.vimeo.com/video/" + a.id + "?autoplay=1&badge=0" : a.id) + (a.s && "custom" != a.type ? "&" + a.s : "")), c += '" frameborder="0" allowfullscreen></iframe></div>'
    }, d(function() {
        d("." + bb + ':not([data-auto="false"])').fotorama()
    })
}(window, document, location, "undefined" != typeof jQuery && jQuery);;/**
 * jquery.gridrotator.js v1.1.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Codrops
 * http://www.codrops.com
 */
;
(function($, window, undefined) {

    'use strict';

    /*
     * debouncedresize: special jQuery event that happens once after a window resize
     *
     * latest version and complete README available on Github:
     * https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
     *
     * Copyright 2011 @louis_remi
     * Licensed under the MIT license.
     */
    var $event = $.event,
        $special,
        resizeTimeout;

    $special = $event.special.debouncedresize = {
        setup: function() {
            $(this).on("resize", $special.handler);
        },
        teardown: function() {
            $(this).off("resize", $special.handler);
        },
        handler: function(event, execAsap) {
            // Save the context
            var context = this,
                args = arguments,
                dispatch = function() {
                    // set correct event type
                    event.type = "debouncedresize";
                    $event.dispatch.apply(context, args);
                };

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            execAsap ?
                dispatch() :
                resizeTimeout = setTimeout(dispatch, $special.threshold);
        },
        threshold: 100
    };

    // http://www.hardcode.nl/subcategory_1/article_317-array-shuffle-function
    Array.prototype.shuffle = function() {
        var i = this.length,
            p, t;
        while (i--) {
            p = Math.floor(Math.random() * i);
            t = this[i];
            this[i] = this[p];
            this[p] = t;
        }
        return this;
    };

    // HTML5 PageVisibility API
    // http://www.html5rocks.com/en/tutorials/pagevisibility/intro/
    // by Joe Marini (@joemarini)
    function getHiddenProp() {
        var prefixes = ['webkit', 'moz', 'ms', 'o'];

        // if 'hidden' is natively supported just return it
        if ('hidden' in document) return 'hidden';

        // otherwise loop over all the known prefixes until we find one
        for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document)
                return prefixes[i] + 'Hidden';
        }

        // otherwise it's not supported
        return null;
    }

    function isHidden() {
        var prop = getHiddenProp();
        if (!prop) return false;

        return document[prop];
    }

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    // global
    var $window = $(window),
        Modernizr = window.Modernizr;

    $.GridRotator = function(options, element) {

        this.$el = $(element);
        if (Modernizr.backgroundsize) {

            var self = this;
            this.$el.addClass('ri-grid-loading');
            this._init(options);

        }

    };

    // the options
    $.GridRotator.defaults = {
        // number of rows
        rows: 4,
        // number of columns 
        columns: 10,
        w992: {
            rows: 3,
            columns: 8
        },
        w768: {
            rows: 3,
            columns: 7
        },
        w480: {
            rows: 3,
            columns: 5
        },
        w320: {
            rows: 2,
            columns: 4
        },
        w240: {
            rows: 2,
            columns: 3
        },
        // step: number of items that are replaced at the same time
        // random || [some number]
        // note: for performance issues, the number "can't" be > options.maxStep
        step: 'random',
        // change it as you wish..
        maxStep: 3,
        // prevent user to click the items
        preventClick: true,
        // animation type
        // showHide || fadeInOut || 
        // slideLeft || slideRight || slideTop || slideBottom || 
        // rotateBottom || rotateLeft || rotateRight || rotateTop || 
        // scale ||
        // rotate3d ||
        // rotateLeftScale || rotateRightScale || rotateTopScale || rotateBottomScale || 
        // random
        animType: 'random',
        // animation speed
        animSpeed: 800,
        // animation easings
        animEasingOut: 'linear',
        animEasingIn: 'linear',
        // the item(s) will be replaced every 3 seconds
        // note: for performance issues, the time "can't" be < 300 ms
        interval: 3000,
        // if false the animations will not start
        // use false if onhover is true for example
        slideshow: true,
        // if true the items will switch when hovered
        onhover: false,
        // ids of elements that shouldn't change
        nochange: []
    };

    $.GridRotator.prototype = {

        _init: function(options) {

            // options
            this.options = $.extend(true, {}, $.GridRotator.defaults, options);
            // cache some elements + variables
            this._config();

        },
        _config: function() {

            var self = this,
                transEndEventNames = {
                    'WebkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd',
                    'msTransition': 'MSTransitionEnd',
                    'transition': 'transitionend'
                };

            // support CSS transitions and 3d transforms
            this.supportTransitions = Modernizr.csstransitions;
            this.supportTransforms3D = Modernizr.csstransforms3d;

            this.transEndEventName = transEndEventNames[Modernizr.prefixed('transition')] + '.gridrotator';

            // all animation types for the random option
            this.animTypes = this.supportTransforms3D ? [
                'fadeInOut',
                'slideLeft',
                'slideRight',
                'slideTop',
                'slideBottom',
                'rotateLeft',
                'rotateRight',
                'rotateTop',
                'rotateBottom',
                // 'scale', 
                'rotate3d',
                // 'rotateLeftScale', 
                // 'rotateRightScale', 
                // 'rotateTopScale', 
                // 'rotateBottomScale' 
            ] :
                ['fadeInOut', 'slideLeft', 'slideRight', 'slideTop', 'slideBottom'];

            this.animType = this.options.animType;

            if (this.animType !== 'random' && !this.supportTransforms3D && $.inArray(this.animType, this.animTypes) === -1 && this.animType !== 'showHide') {

                // fallback to 'fadeInOut' if user sets a type which is not supported
                this.animType = 'fadeInOut';

            }

            this.animTypesTotal = this.animTypes.length;

            // the <ul> where the items are placed
            this.$list = this.$el.children('ul');
            // remove images and add background-image to anchors
            // preload the images before
            var loaded = 0,
                $imgs = this.$list.find('img'),
                count = $imgs.length;

            $imgs.each(function() {

                var $img = $(this),
                    src = $img.attr('src');

                $('<img/>').load(function() {

                    ++loaded;
                    $img.parent().css('background-image', 'url(' + src + ')');

                    if (loaded === count) {

                        $imgs.remove();
                        self.$el.removeClass('ri-grid-loading');
                        // the items
                        self.$items = self.$list.children('li');
                        // make a copy of the items
                        self.$itemsCache = self.$items.clone();
                        // total number of items
                        self.itemsTotal = self.$items.length;
                        // the items that will be out of the grid
                        // actually the item's child (anchor element)
                        self.outItems = [];
                        self._layout(function() {
                            self._initEvents();
                        });
                        // replace [options.step] items after [options.interval] time
                        // the items that go out are randomly chosen, while the ones that get in
                        // follow a "First In First Out" logic
                        self._start();

                    }

                }).attr('src', src)

            });

        },
        _layout: function(callback) {

            var self = this;

            // sets the grid dimentions based on the container's width
            this._setGridDim();

            // reset
            this.$list.empty();
            this.$items = this.$itemsCache.clone().appendTo(this.$list);

            var $outItems = this.$items.filter(':gt(' + (this.showTotal - 1) + ')'),
                $outAItems = $outItems.children('a');

            this.outItems.length = 0;

            $outAItems.each(function(i) {
                self.outItems.push($(this));
            });

            $outItems.remove();

            // container's width
            var containerWidth = (document.defaultView) ? parseInt(document.defaultView.getComputedStyle(this.$el.get(0), null).width) : this.$el.width(),
                // item's width
                itemWidth = Math.floor(containerWidth / this.columns),
                // calculate gap
                gapWidth = containerWidth - (this.columns * Math.floor(itemWidth));

            for (var i = 0; i < this.rows; ++i) {

                for (var j = 0; j < this.columns; ++j) {

                    var idx = this.columns * i + j,
                        $item = this.$items.eq(idx);

                    $item.css({
                        width: j < Math.floor(gapWidth) ? itemWidth + 1 : itemWidth,
                        height: itemWidth
                    });

                    if ($.inArray(idx, this.options.nochange) !== -1) {
                        $item.addClass('ri-nochange').data('nochange', true);
                    }

                }

            }

            if (this.options.preventClick) {

                this.$items.children().css('cursor', 'default').on('click.gridrotator', false);

            }

            if (callback) {
                callback.call();
            }

        },
        // set the grid rows and columns
        _setGridDim: function() {

            // container's width
            var c_w = this.$el.width();

            // we will choose the number of rows/columns according to the container's width and the values set in the plugin options 
            switch (true) {
                case (c_w < 240):
                    this.rows = this.options.w240.rows;
                    this.columns = this.options.w240.columns;
                    break;
                case (c_w < 320):
                    this.rows = this.options.w320.rows;
                    this.columns = this.options.w320.columns;
                    break;
                case (c_w < 480):
                    this.rows = this.options.w480.rows;
                    this.columns = this.options.w480.columns;
                    break;
                case (c_w < 768):
                    this.rows = this.options.w768.rows;
                    this.columns = this.options.w768.columns;
                    break;
                case (c_w < 992):
                    this.rows = this.options.w992.rows;
                    this.columns = this.options.w992.columns;
                    break;
                default:
                    this.rows = this.options.rows;
                    this.columns = this.options.columns;
                    break;
            }

            this.showTotal = this.rows * this.columns;

        },
        // init window resize event
        _initEvents: function() {

            var self = this;

            $window.on('debouncedresize.gridrotator', function() {
                self._layout();
            });

            // use the property name to generate the prefixed event name
            var visProp = getHiddenProp();

            // HTML5 PageVisibility API
            // http://www.html5rocks.com/en/tutorials/pagevisibility/intro/
            // by Joe Marini (@joemarini)
            if (visProp) {

                var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
                document.addEventListener(evtname, function() {
                    self._visChange();
                });

            }

            if (!Modernizr.touch && this.options.onhover) {

                self.$items.on('mouseenter.gridrotator', function() {

                    var $item = $(this);
                    if (!$item.data('active') && !$item.data('hovered') && !$item.data('nochange')) {
                        $item.data('hovered', true);
                        self._replace($item);
                    }

                }).on('mouseleave.gridrotator', function() {

                    $(this).data('hovered', false);

                });

            }

        },
        _visChange: function() {

            isHidden() ? clearTimeout(this.playtimeout) : this._start();

        },
        // start rotating elements
        _start: function() {

            if (this.showTotal < this.itemsTotal && this.options.slideshow) {
                this._showNext();
            }

        },
        // get which type of animation
        _getAnimType: function() {

            return this.animType === 'random' ? this.animTypes[Math.floor(Math.random() * this.animTypesTotal)] : this.animType;

        },
        // get css properties for the transition effect
        _getAnimProperties: function($out) {

            var startInProp = {},
                startOutProp = {},
                endInProp = {},
                endOutProp = {},
                animType = this._getAnimType(),
                speed, delay = 0;

            switch (animType) {

                case 'showHide':

                    speed = 0;
                    endOutProp.opacity = 0;
                    break;

                case 'fadeInOut':

                    endOutProp.opacity = 0;
                    break;

                case 'slideLeft':

                    startInProp.left = $out.width();
                    endInProp.left = 0;
                    endOutProp.left = -$out.width();
                    break;

                case 'slideRight':

                    startInProp.left = -$out.width();
                    endInProp.left = 0;
                    endOutProp.left = $out.width();
                    break;

                case 'slideTop':

                    startInProp.top = $out.height();
                    endInProp.top = 0;
                    endOutProp.top = -$out.height();
                    break;

                case 'slideBottom':

                    startInProp.top = -$out.height();
                    endInProp.top = 0;
                    endOutProp.top = $out.height();
                    break;

                case 'rotateLeft':

                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'rotateY(90deg)';
                    endInProp.transform = 'rotateY(0deg)';
                    delay = speed;
                    endOutProp.transform = 'rotateY(-90deg)';
                    break;

                case 'rotateRight':

                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'rotateY(-90deg)';
                    endInProp.transform = 'rotateY(0deg)';
                    delay = speed;
                    endOutProp.transform = 'rotateY(90deg)';
                    break;

                case 'rotateTop':

                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'rotateX(90deg)';
                    endInProp.transform = 'rotateX(0deg)';
                    delay = speed;
                    endOutProp.transform = 'rotateX(-90deg)';
                    break;

                case 'rotateBottom':

                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'rotateX(-90deg)';
                    endInProp.transform = 'rotateX(0deg)';
                    delay = speed;
                    endOutProp.transform = 'rotateX(90deg)';
                    break;

                case 'scale':

                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'scale(0)';
                    startOutProp.transform = 'scale(1)';
                    endInProp.transform = 'scale(1)';
                    delay = speed;
                    endOutProp.transform = 'scale(0)';
                    break;

                case 'rotateLeftScale':

                    startOutProp.transform = 'scale(1)';
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'scale(0.3) rotateY(90deg)';
                    endInProp.transform = 'scale(1) rotateY(0deg)';
                    delay = speed;
                    endOutProp.transform = 'scale(0.3) rotateY(-90deg)';
                    break;

                case 'rotateRightScale':

                    startOutProp.transform = 'scale(1)';
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'scale(0.3) rotateY(-90deg)';
                    endInProp.transform = 'scale(1) rotateY(0deg)';
                    delay = speed;
                    endOutProp.transform = 'scale(0.3) rotateY(90deg)';
                    break;

                case 'rotateTopScale':

                    startOutProp.transform = 'scale(1)';
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'scale(0.3) rotateX(90deg)';
                    endInProp.transform = 'scale(1) rotateX(0deg)';
                    delay = speed;
                    endOutProp.transform = 'scale(0.3) rotateX(-90deg)';
                    break;

                case 'rotateBottomScale':

                    startOutProp.transform = 'scale(1)';
                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'scale(0.3) rotateX(-90deg)';
                    endInProp.transform = 'scale(1) rotateX(0deg)';
                    delay = speed;
                    endOutProp.transform = 'scale(0.3) rotateX(90deg)';
                    break;

                case 'rotate3d':

                    speed = this.options.animSpeed / 2;
                    startInProp.transform = 'rotate3d( 1, 1, 0, 90deg )';
                    endInProp.transform = 'rotate3d( 1, 1, 0, 0deg )';
                    delay = speed;
                    endOutProp.transform = 'rotate3d( 1, 1, 0, -90deg )';
                    break;

            }

            return {
                startInProp: startInProp,
                startOutProp: startOutProp,
                endInProp: endInProp,
                endOutProp: endOutProp,
                delay: delay,
                animSpeed: speed != undefined ? speed : this.options.animSpeed
            };

        },
        // show next [option.step] elements
        _showNext: function(time) {

            var self = this;

            clearTimeout(this.playtimeout);

            this.playtimeout = setTimeout(function() {

                var step = self.options.step,
                    max = self.options.maxStep,
                    min = 1;

                if (max > self.showTotal) {
                    max = self.showTotal;
                }

                // number of items to swith at this point of time
                var nmbOut = step === 'random' ? Math.floor(Math.random() * max + min) : Math.min(Math.abs(step), max),
                    // array with random indexes. These will be the indexes of the items we will replace
                    randArr = self._getRandom(nmbOut, self.showTotal);

                for (var i = 0; i < nmbOut; ++i) {

                    // element to go out
                    var $out = self.$items.eq(randArr[i]);

                    // if element is active, which means it is currently animating,
                    // then we need to get different positions.. 
                    if ($out.data('active') || $out.data('nochange')) {

                        // one of the items is active, call again..
                        self._showNext(1);
                        return false;

                    }

                    self._replace($out);

                }

                // again and again..
                self._showNext();

            }, time || Math.max(Math.abs(this.options.interval), 300));

        },
        _replace: function($out) {

            $out.data('active', true);

            var self = this,
                $outA = $out.children('a:last'),
                newElProp = {
                    width: $outA.width(),
                    height: $outA.height()
                };

            // element stays active
            $out.data('active', true);

            // get the element (anchor) that will go in (first one inserted in this.outItems)
            var $inA = this.outItems.shift();

            // save element that went out
            this.outItems.push($outA.clone().css('transition', 'none'));

            // prepend in element
            $inA.css(newElProp).prependTo($out);

            var animProp = this._getAnimProperties($outA);

            $inA.css(animProp.startInProp);
            $outA.css(animProp.startOutProp);

            this._setTransition($inA, 'all', animProp.animSpeed, animProp.delay, this.options.animEasingIn);
            this._setTransition($outA, 'all', animProp.animSpeed, 0, this.options.animEasingOut);

            this._applyTransition($inA, animProp.endInProp, animProp.animSpeed, function() {

                var $el = $(this),
                    t = animProp.animSpeed === self.options.animSpeed && isEmpty(animProp.endInProp) ? animProp.animSpeed : 0;

                setTimeout(function() {

                    if (self.supportTransitions) {
                        $el.off(self.transEndEventName);
                    }

                    $el.next().remove();
                    $el.parent().data('active', false);

                }, t);

            }, animProp.animSpeed === 0 || isEmpty(animProp.endInProp));
            this._applyTransition($outA, animProp.endOutProp, animProp.animSpeed);

        },
        _getRandom: function(cnt, limit) {

            var randArray = [];

            for (var i = 0; i < limit; ++i) {
                randArray.push(i)
            }

            return randArray.shuffle().slice(0, cnt);

        },
        _setTransition: function(el, prop, speed, delay, easing) {

            setTimeout(function() {
                el.css('transition', prop + ' ' + speed + 'ms ' + delay + 'ms ' + easing);
            }, 25);

        },
        _applyTransition: function(el, styleCSS, speed, fncomplete, force) {

            var self = this;
            setTimeout(function() {
                $.fn.applyStyle = self.supportTransitions ? $.fn.css : $.fn.animate;

                if (fncomplete && self.supportTransitions) {

                    el.on(self.transEndEventName, fncomplete);

                    if (force) {
                        fncomplete.call(el);
                    }

                }

                fncomplete = fncomplete || function() {
                    return false;
                };

                el.stop().applyStyle(styleCSS, $.extend(true, [], {
                    duration: speed + 'ms',
                    complete: fncomplete
                }));
            }, 25);

        }

    };

    var logError = function(message) {

        if (window.console) {

            window.console.error(message);

        }

    };

    $.fn.gridrotator = function(options) {

        var instance = $.data(this, 'gridrotator');

        if (typeof options === 'string') {

            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function() {

                if (!instance) {

                    logError("cannot call methods on gridrotator prior to initialization; " +
                        "attempted to call method '" + options + "'");
                    return;

                }

                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {

                    logError("no such method '" + options + "' for gridrotator instance");
                    return;

                }

                instance[options].apply(instance, args);

            });

        } else {

            this.each(function() {

                if (instance) {

                    instance._init();

                } else {

                    instance = $.data(this, 'gridrotator', new $.GridRotator(options, this));

                }

            });

        }

        return instance;

    };

})(jQuery, window);;/*!
 * iCheck v1.0.2, http://git.io/arlzeA
 * ===================================
 * Powerful jQuery and Zepto plugin for checkboxes and radio buttons customization
 *
 * (c) 2013 Damir Sultanov, http://fronteed.com
 * MIT Licensed
 */

(function($) {

    // Cached vars
    var _iCheck = 'iCheck',
        _iCheckHelper = _iCheck + '-helper',
        _checkbox = 'checkbox',
        _radio = 'radio',
        _checked = 'checked',
        _unchecked = 'un' + _checked,
        _disabled = 'disabled',
        a
        _determinate = 'determinate',
        _indeterminate = 'in' + _determinate,
        _update = 'update',
        _type = 'type',
        _click = 'click',
        _touch = 'touchbegin.i touchend.i',
        _add = 'addClass',
        _remove = 'removeClass',
        _callback = 'trigger',
        _label = 'label',
        _cursor = 'cursor',
        _mobile = /ipad|iphone|ipod|android|blackberry|windows phone|opera mini|silk/i.test(navigator.userAgent);

    // Plugin init
    $.fn[_iCheck] = function(options, fire) {

        // Walker
        var handle = 'input[type="' + _checkbox + '"], input[type="' + _radio + '"]',
            stack = $(),
            walker = function(object) {
                object.each(function() {
                    var self = $(this);

                    if (self.is(handle)) {
                        stack = stack.add(self);
                    } else {
                        stack = stack.add(self.find(handle));
                    }
                });
            };

        // Check if we should operate with some method
        if (/^(check|uncheck|toggle|indeterminate|determinate|disable|enable|update|destroy)$/i.test(options)) {

            // Normalize method's name
            options = options.toLowerCase();

            // Find checkboxes and radio buttons
            walker(this);

            return stack.each(function() {
                var self = $(this);

                if (options == 'destroy') {
                    tidy(self, 'ifDestroyed');
                } else {
                    operate(self, true, options);
                }

                // Fire method's callback
                if ($.isFunction(fire)) {
                    fire();
                }
            });

            // Customization
        } else if (typeof options == 'object' || !options) {

            // Check if any options were passed
            var settings = $.extend({
                checkedClass: _checked,
                disabledClass: _disabled,
                indeterminateClass: _indeterminate,
                labelHover: true
            }, options),

                selector = settings.handle,
                hoverClass = settings.hoverClass || 'hover',
                focusClass = settings.focusClass || 'focus',
                activeClass = settings.activeClass || 'active',
                labelHover = !! settings.labelHover,
                labelHoverClass = settings.labelHoverClass || 'hover',

                // Setup clickable area
                area = ('' + settings.increaseArea).replace('%', '') | 0;

            // Selector limit
            if (selector == _checkbox || selector == _radio) {
                handle = 'input[type="' + selector + '"]';
            }

            // Clickable area limit
            if (area < -50) {
                area = -50;
            }

            // Walk around the selector
            walker(this);

            return stack.each(function() {
                var self = $(this);

                // If already customized
                tidy(self);

                var node = this,
                    id = node.id,

                    // Layer styles
                    offset = -area + '%',
                    size = 100 + (area * 2) + '%',
                    layer = {
                        position: 'absolute',
                        top: offset,
                        left: offset,
                        display: 'block',
                        width: size,
                        height: size,
                        margin: 0,
                        padding: 0,
                        background: '#fff',
                        border: 0,
                        opacity: 0
                    },

                    // Choose how to hide input
                    hide = _mobile ? {
                        position: 'absolute',
                        visibility: 'hidden'
                    } : area ? layer : {
                        position: 'absolute',
                        opacity: 0
                    },

                    // Get proper class
                    className = node[_type] == _checkbox ? settings.checkboxClass || 'i' + _checkbox : settings.radioClass || 'i' + _radio,

                    // Find assigned labels
                    label = $(_label + '[for="' + id + '"]').add(self.closest(_label)),

                    // Check ARIA option
                    aria = !! settings.aria,

                    // Set ARIA placeholder
                    ariaID = _iCheck + '-' + Math.random().toString(36).substr(2, 6),

                    // Parent & helper
                    parent = '<div class="' + className + '" ' + (aria ? 'role="' + node[_type] + '" ' : ''),
                    helper;

                // Set ARIA "labelledby"
                if (aria) {
                    label.each(function() {
                        parent += 'aria-labelledby="';

                        if (this.id) {
                            parent += this.id;
                        } else {
                            this.id = ariaID;
                            parent += ariaID;
                        }

                        parent += '"';
                    });
                }

                // Wrap input
                parent = self.wrap(parent + '/>')[_callback]('ifCreated').parent().append(settings.insert);

                // Layer addition
                helper = $('<ins class="' + _iCheckHelper + '"/>').css(layer).appendTo(parent);

                // Finalize customization
                self.data(_iCheck, {
                    o: settings,
                    s: self.attr('style')
                }).css(hide); !! settings.inheritClass && parent[_add](node.className || ''); !! settings.inheritID && id && parent.attr('id', _iCheck + '-' + id);
                parent.css('position') == 'static' && parent.css('position', 'relative');
                operate(self, true, _update);

                // Label events
                if (label.length) {
                    label.on(_click + '.i mouseover.i mouseout.i ' + _touch, function(event) {
                        var type = event[_type],
                            item = $(this);

                        // Do nothing if input is disabled
                        if (!node[_disabled]) {

                            // Click
                            if (type == _click) {
                                if ($(event.target).is('a')) {
                                    return;
                                }
                                operate(self, false, true);

                                // Hover state
                            } else if (labelHover) {

                                // mouseout|touchend
                                if (/ut|nd/.test(type)) {
                                    parent[_remove](hoverClass);
                                    item[_remove](labelHoverClass);
                                } else {
                                    parent[_add](hoverClass);
                                    item[_add](labelHoverClass);
                                }
                            }

                            if (_mobile) {
                                event.stopPropagation();
                            } else {
                                return false;
                            }
                        }
                    });
                }

                // Input events
                self.on(_click + '.i focus.i blur.i keyup.i keydown.i keypress.i', function(event) {
                    var type = event[_type],
                        key = event.keyCode;

                    // Click
                    if (type == _click) {
                        return false;

                        // Keydown
                    } else if (type == 'keydown' && key == 32) {
                        if (!(node[_type] == _radio && node[_checked])) {
                            if (node[_checked]) {
                                off(self, _checked);
                            } else {
                                on(self, _checked);
                            }
                        }

                        return false;

                        // Keyup
                    } else if (type == 'keyup' && node[_type] == _radio) {
                        !node[_checked] && on(self, _checked);

                        // Focus/blur
                    } else if (/us|ur/.test(type)) {
                        parent[type == 'blur' ? _remove : _add](focusClass);
                    }
                });

                // Helper events
                helper.on(_click + ' mousedown mouseup mouseover mouseout ' + _touch, function(event) {
                    var type = event[_type],

                        // mousedown|mouseup
                        toggle = /wn|up/.test(type) ? activeClass : hoverClass;

                    // Do nothing if input is disabled
                    if (!node[_disabled]) {

                        // Click
                        if (type == _click) {
                            operate(self, false, true);

                            // Active and hover states
                        } else {

                            // State is on
                            if (/wn|er|in/.test(type)) {

                                // mousedown|mouseover|touchbegin
                                parent[_add](toggle);

                                // State is off
                            } else {
                                parent[_remove](toggle + ' ' + activeClass);
                            }

                            // Label hover
                            if (label.length && labelHover && toggle == hoverClass) {

                                // mouseout|touchend
                                label[/ut|nd/.test(type) ? _remove : _add](labelHoverClass);
                            }
                        }

                        if (_mobile) {
                            event.stopPropagation();
                        } else {
                            return false;
                        }
                    }
                });
            });
        } else {
            return this;
        }
    };

    // Do something with inputs
    function operate(input, direct, method) {
        var node = input[0],
            state = /er/.test(method) ? _indeterminate : /bl/.test(method) ? _disabled : _checked,
            active = method == _update ? {
                checked: node[_checked],
                disabled: node[_disabled],
                indeterminate: input.attr(_indeterminate) == 'true' || input.attr(_determinate) == 'false'
            } : node[state];

        // Check, disable or indeterminate
        if (/^(ch|di|in)/.test(method) && !active) {
            on(input, state);

            // Uncheck, enable or determinate
        } else if (/^(un|en|de)/.test(method) && active) {
            off(input, state);

            // Update
        } else if (method == _update) {

            // Handle states
            for (var each in active) {
                if (active[each]) {
                    on(input, each, true);
                } else {
                    off(input, each, true);
                }
            }

        } else if (!direct || method == 'toggle') {

            // Helper or label was clicked
            if (!direct) {
                input[_callback]('ifClicked');
            }

            // Toggle checked state
            if (active) {
                if (node[_type] !== _radio) {
                    off(input, state);
                }
            } else {
                on(input, state);
            }
        }
    }

    // Add checked, disabled or indeterminate state
    function on(input, state, keep) {
        var node = input[0],
            parent = input.parent(),
            checked = state == _checked,
            indeterminate = state == _indeterminate,
            disabled = state == _disabled,
            callback = indeterminate ? _determinate : checked ? _unchecked : 'enabled',
            regular = option(input, callback + capitalize(node[_type])),
            specific = option(input, state + capitalize(node[_type]));

        // Prevent unnecessary actions
        if (node[state] !== true) {

            // Toggle assigned radio buttons
            if (!keep && state == _checked && node[_type] == _radio && node.name) {
                var form = input.closest('form'),
                    inputs = 'input[name="' + node.name + '"]';

                inputs = form.length ? form.find(inputs) : $(inputs);

                inputs.each(function() {
                    if (this !== node && $(this).data(_iCheck)) {
                        off($(this), state);
                    }
                });
            }

            // Indeterminate state
            if (indeterminate) {

                // Add indeterminate state
                node[state] = true;

                // Remove checked state
                if (node[_checked]) {
                    off(input, _checked, 'force');
                }

                // Checked or disabled state
            } else {

                // Add checked or disabled state
                if (!keep) {
                    node[state] = true;
                }

                // Remove indeterminate state
                if (checked && node[_indeterminate]) {
                    off(input, _indeterminate, false);
                }
            }

            // Trigger callbacks
            callbacks(input, checked, state, keep);
        }

        // Add proper cursor
        if (node[_disabled] && !! option(input, _cursor, true)) {
            parent.find('.' + _iCheckHelper).css(_cursor, 'default');
        }

        // Add state class
        parent[_add](specific || option(input, state) || '');

        // Set ARIA attribute
        if ( !! parent.attr('role') && !indeterminate) {
            parent.attr('aria-' + (disabled ? _disabled : _checked), 'true');
        }

        // Remove regular state class
        parent[_remove](regular || option(input, callback) || '');
    }

    // Remove checked, disabled or indeterminate state
    function off(input, state, keep) {
        var node = input[0],
            parent = input.parent(),
            checked = state == _checked,
            indeterminate = state == _indeterminate,
            disabled = state == _disabled,
            callback = indeterminate ? _determinate : checked ? _unchecked : 'enabled',
            regular = option(input, callback + capitalize(node[_type])),
            specific = option(input, state + capitalize(node[_type]));

        // Prevent unnecessary actions
        if (node[state] !== false) {

            // Toggle state
            if (indeterminate || !keep || keep == 'force') {
                node[state] = false;
            }

            // Trigger callbacks
            callbacks(input, checked, callback, keep);
        }

        // Add proper cursor
        if (!node[_disabled] && !! option(input, _cursor, true)) {
            parent.find('.' + _iCheckHelper).css(_cursor, 'pointer');
        }

        // Remove state class
        parent[_remove](specific || option(input, state) || '');

        // Set ARIA attribute
        if ( !! parent.attr('role') && !indeterminate) {
            parent.attr('aria-' + (disabled ? _disabled : _checked), 'false');
        }

        // Add regular state class
        parent[_add](regular || option(input, callback) || '');
    }

    // Remove all traces
    function tidy(input, callback) {
        if (input.data(_iCheck)) {

            // Remove everything except input
            input.parent().html(input.attr('style', input.data(_iCheck).s || ''));

            // Callback
            if (callback) {
                input[_callback](callback);
            }

            // Unbind events
            input.off('.i').unwrap();
            $(_label + '[for="' + input[0].id + '"]').add(input.closest(_label)).off('.i');
        }
    }

    // Get some option
    function option(input, state, regular) {
        if (input.data(_iCheck)) {
            return input.data(_iCheck).o[state + (regular ? '' : 'Class')];
        }
    }

    // Capitalize some string
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Executable handlers
    function callbacks(input, checked, callback, keep) {
        if (!keep) {
            if (checked) {
                input[_callback]('ifToggled');
            }

            input[_callback]('ifChanged')[_callback]('if' + capitalize(callback));
        }
    }
})(window.jQuery || window.Zepto);;// Ion.RangeSlider
// version 1.9.0 Build: 167
// © 2013-2014 Denis Ineshin | IonDen.com
//
// Project page:    http://ionden.com/a/plugins/ion.rangeSlider/
// GitHub page:     https://github.com/IonDen/ion.rangeSlider
//
// Released under MIT licence:
// http://ionden.com/a/plugins/licence-en.html
// =====================================================================================================================

(function($, document, window, navigator) {
    "use strict";

    var pluginCount = 0,
        current;

    var isOldie = (function() {
        var n = navigator.userAgent,
            r = /msie\s\d+/i,
            v;
        if (n.search(r) > 0) {
            v = r.exec(n).toString();
            v = v.split(" ")[1];
            if (v < 9) {
                return true;
            }
        }
        return false;
    }());
    var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

    var testNumber = function(num) {
        if (typeof num === "Number") {
            if (isNaN(num)) {
                return null;
            } else {
                return num;
            }
        } else {
            num = parseFloat(num);
            if (isNaN(num)) {
                return null;
            } else {
                return num;
            }
        }
    };

    var methods = {
        init: function(options) {

            // irs = ion range slider css prefix
            var baseHTML =
                '<span class="irs">' +
                '<span class="irs-line"><span class="irs-line-left"></span><span class="irs-line-mid"></span><span class="irs-line-right"></span></span>' +
                '<span class="irs-min">0</span><span class="irs-max">1</span>' +
                '<span class="irs-from">0</span><span class="irs-to">0</span><span class="irs-single">0</span>' +
                '</span>' +
                '<span class="irs-grid"></span>';

            var singleHTML =
                '<span class="irs-slider single"></span>';

            var doubleHTML =
                '<span class="irs-diapason"></span>' +
                '<span class="irs-slider from"></span>' +
                '<span class="irs-slider to"></span>';

            var disableHTML =
                '<span class="irs-disable-mask"></span>';



            return this.each(function() {
                var settings = $.extend({
                    min: null,
                    max: null,
                    from: null,
                    to: null,
                    type: "single",
                    step: null,
                    prefix: "",
                    postfix: "",
                    maxPostfix: "",
                    hasGrid: false,
                    hideMinMax: false,
                    hideFromTo: false,
                    prettify: true,
                    disable: false,
                    values: null,
                    onChange: null,
                    onLoad: null,
                    onFinish: null
                }, options);



                var slider = $(this),
                    self = this,
                    allow_values = false,
                    value_array = null;

                if (slider.data("isActive")) {
                    return;
                }
                slider.data("isActive", true);

                pluginCount += 1;
                this.pluginCount = pluginCount;



                // check default values
                if (slider.prop("value")) {
                    value_array = slider.prop("value").split(";");
                }

                if (settings.type === "single") {

                    if (value_array && value_array.length > 1) {

                        if (typeof settings.min !== "number") {
                            settings.min = parseFloat(value_array[0]);
                        } else {
                            if (typeof settings.from !== "number") {
                                settings.from = parseFloat(value_array[0]);
                            }
                        }

                        if (typeof settings.max !== "number") {
                            settings.max = parseFloat(value_array[1]);
                        }

                    } else if (value_array && value_array.length === 1) {

                        if (typeof settings.from !== "number") {
                            settings.from = parseFloat(value_array[0]);
                        }

                    }

                } else if (settings.type === "double") {

                    if (value_array && value_array.length > 1) {

                        if (typeof settings.min !== "number") {
                            settings.min = parseFloat(value_array[0]);
                        } else {
                            if (typeof settings.from !== "number") {
                                settings.from = parseFloat(value_array[0]);
                            }
                        }

                        if (typeof settings.max !== "number") {
                            settings.max = parseFloat(value_array[1]);
                        } else {
                            if (typeof settings.to !== "number") {
                                settings.to = parseFloat(value_array[1]);
                            }
                        }

                    } else if (value_array && value_array.length === 1) {

                        if (typeof settings.min !== "number") {
                            settings.min = parseFloat(value_array[0]);
                        } else {
                            if (typeof settings.from !== "number") {
                                settings.from = parseFloat(value_array[0]);
                            }
                        }

                    }

                }



                // extend from data-*
                if (typeof slider.data("min") === "number") {
                    settings.min = parseFloat(slider.data("min"));
                }
                if (typeof slider.data("max") === "number") {
                    settings.max = parseFloat(slider.data("max"));
                }
                if (typeof slider.data("from") === "number") {
                    settings.from = parseFloat(slider.data("from"));
                }
                if (typeof slider.data("to") === "number") {
                    settings.to = parseFloat(slider.data("to"));
                }
                if (slider.data("step")) {
                    settings.step = parseFloat(slider.data("step"));
                }
                if (slider.data("type")) {
                    settings.type = slider.data("type");
                }
                if (slider.data("prefix")) {
                    settings.prefix = slider.data("prefix");
                }
                if (slider.data("postfix")) {
                    settings.postfix = slider.data("postfix");
                }
                if (slider.data("maxpostfix")) {
                    settings.maxPostfix = slider.data("maxpostfix");
                }
                if (slider.data("hasgrid")) {
                    settings.hasGrid = slider.data("hasgrid");
                }
                if (slider.data("hideminmax")) {
                    settings.hideMinMax = slider.data("hideminmax");
                }
                if (slider.data("hidefromto")) {
                    settings.hideFromTo = slider.data("hidefromto");
                }
                if (slider.data("prettify")) {
                    settings.prettify = slider.data("prettify");
                }
                if (slider.data("disable")) {
                    settings.disable = slider.data("disable");
                }
                if (slider.data("values")) {
                    settings.values = slider.data("values").split(",");
                }



                // Set Min and Max if no
                settings.min = testNumber(settings.min);
                if (!settings.min && settings.min !== 0) {
                    settings.min = 10;
                }

                settings.max = testNumber(settings.max);
                if (!settings.max && settings.max !== 0) {
                    settings.max = 100;
                }



                // Set values
                if (Object.prototype.toString.call(settings.values) !== "[object Array]") {
                    settings.values = null;
                }
                if (settings.values && settings.values.length > 0) {
                    settings.min = 0;
                    settings.max = settings.values.length - 1;
                    settings.step = 1;
                    allow_values = true;
                }



                // Set From and To if no
                settings.from = testNumber(settings.from);
                if (!settings.from && settings.from !== 0) {
                    settings.from = settings.min;
                }

                settings.to = testNumber(settings.to);
                if (!settings.to && settings.to !== 0) {
                    settings.to = settings.max;
                }


                // Set step
                settings.step = testNumber(settings.step);
                if (!settings.step) {
                    settings.step = 1;
                }



                // fix diapason
                if (settings.from < settings.min) {
                    settings.from = settings.min;
                }
                if (settings.from > settings.max) {
                    settings.from = settings.min;
                }

                if (settings.to < settings.min) {
                    settings.to = settings.max;
                }
                if (settings.to > settings.max) {
                    settings.to = settings.max;
                }

                if (settings.type === "double") {
                    if (settings.from > settings.to) {
                        settings.from = settings.to;
                    }
                    if (settings.to < settings.from) {
                        settings.to = settings.from;
                    }
                }


                var prettify = function(num) {
                    var n = num.toString();
                    if (settings.prettify) {
                        n = n.replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1 ");
                    }
                    return n;
                };


                var containerHTML = '<span class="irs" id="irs-' + this.pluginCount + '"></span>';
                slider[0].style.display = "none";
                slider.before(containerHTML);

                var $container = slider.prev(),
                    $body = $(document.body),
                    $window = $(window),
                    $rangeSlider,
                    $fieldMin,
                    $fieldMax,
                    $fieldFrom,
                    $fieldTo,
                    $fieldSingle,
                    $singleSlider,
                    $fromSlider,
                    $toSlider,
                    $activeSlider,
                    $diapason,
                    $grid;

                var allowDrag = false,
                    sliderIsActive = false,
                    firstStart = true,
                    numbers = {};

                var mouseX = 0,
                    fieldMinWidth = 0,
                    fieldMaxWidth = 0,
                    normalWidth = 0,
                    fullWidth = 0,
                    sliderWidth = 0,
                    width = 0,
                    left = 0,
                    right = 0,
                    minusX = 0,
                    stepFloat = 0;


                if (parseInt(settings.step, 10) !== parseFloat(settings.step)) {
                    stepFloat = settings.step.toString().split(".")[1];
                    stepFloat = Math.pow(10, stepFloat.length);
                }



                // public methods
                this.updateData = function(options) {
                    firstStart = true;
                    settings = $.extend(settings, options);
                    removeHTML();
                };
                this.removeSlider = function() {
                    $container.find("*").off();
                    $window.off("mouseup.irs" + self.pluginCount);
                    $body.off("mouseup.irs" + self.pluginCount);
                    $body.off("mousemove.irs" + self.pluginCount);
                    $container.html("").remove();
                    slider.data("isActive", false);
                    slider.show();
                };





                // private methods
                var removeHTML = function() {
                    $container.find("*").off();
                    $window.off("mouseup.irs" + self.pluginCount);
                    $body.off("mouseup.irs" + self.pluginCount);
                    $body.off("mousemove.irs" + self.pluginCount);
                    $container.html("");

                    placeHTML();
                };
                var placeHTML = function() {
                    $container.html(baseHTML);
                    $rangeSlider = $container.find(".irs");

                    $fieldMin = $rangeSlider.find(".irs-min");
                    $fieldMax = $rangeSlider.find(".irs-max");
                    $fieldFrom = $rangeSlider.find(".irs-from");
                    $fieldTo = $rangeSlider.find(".irs-to");
                    $fieldSingle = $rangeSlider.find(".irs-single");
                    $grid = $container.find(".irs-grid");

                    if (settings.hideMinMax) {
                        $fieldMin[0].style.display = "none";
                        $fieldMax[0].style.display = "none";

                        fieldMinWidth = 0;
                        fieldMaxWidth = 0;
                    }
                    if (settings.hideFromTo) {
                        $fieldFrom[0].style.display = "none";
                        $fieldTo[0].style.display = "none";
                        $fieldSingle[0].style.display = "none";
                    }
                    if (!settings.hideMinMax) {
                        if (settings.values) {
                            $fieldMin.html(settings.prefix + settings.values[0] + settings.postfix);
                            $fieldMax.html(settings.prefix + settings.values[settings.values.length - 1] + settings.maxPostfix + settings.postfix);
                        } else {
                            $fieldMin.html(settings.prefix + prettify(settings.min) + settings.postfix);
                            $fieldMax.html(settings.prefix + prettify(settings.max) + settings.maxPostfix + settings.postfix);
                        }

                        fieldMinWidth = $fieldMin.outerWidth();
                        fieldMaxWidth = $fieldMax.outerWidth();
                    }

                    if (settings.type === "single") {
                        $rangeSlider.append(singleHTML);

                        $singleSlider = $rangeSlider.find(".single");

                        $singleSlider.on("mousedown", function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            calcDimensions(e, $(this), null);

                            allowDrag = true;
                            sliderIsActive = true;
                            current = self.pluginCount;

                            if (isOldie) {
                                $("*").prop("unselectable", true);
                            }
                        });
                        if (isTouch) {
                            $singleSlider.on("touchstart", function(e) {
                                e.preventDefault();
                                e.stopPropagation();

                                calcDimensions(e.originalEvent.touches[0], $(this), null);

                                allowDrag = true;
                                sliderIsActive = true;
                                current = self.pluginCount;
                            });
                        }

                    } else if (settings.type === "double") {
                        $rangeSlider.append(doubleHTML);

                        $fromSlider = $rangeSlider.find(".from");
                        $toSlider = $rangeSlider.find(".to");
                        $diapason = $rangeSlider.find(".irs-diapason");

                        setDiapason();

                        $fromSlider.on("mousedown", function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            $(this).addClass("last");
                            $toSlider.removeClass("last");
                            calcDimensions(e, $(this), "from");

                            allowDrag = true;
                            sliderIsActive = true;
                            current = self.pluginCount;

                            if (isOldie) {
                                $("*").prop("unselectable", true);
                            }
                        });
                        $toSlider.on("mousedown", function(e) {
                            e.preventDefault();
                            e.stopPropagation();

                            $(this).addClass("last");
                            $fromSlider.removeClass("last");
                            calcDimensions(e, $(this), "to");

                            allowDrag = true;
                            sliderIsActive = true;
                            current = self.pluginCount;

                            if (isOldie) {
                                $("*").prop("unselectable", true);
                            }
                        });

                        if (isTouch) {
                            $fromSlider.on("touchstart", function(e) {
                                e.preventDefault();
                                e.stopPropagation();

                                $(this).addClass("last");
                                $toSlider.removeClass("last");
                                calcDimensions(e.originalEvent.touches[0], $(this), "from");

                                allowDrag = true;
                                sliderIsActive = true;
                                current = self.pluginCount;
                            });
                            $toSlider.on("touchstart", function(e) {
                                e.preventDefault();
                                e.stopPropagation();

                                $(this).addClass("last");
                                $fromSlider.removeClass("last");
                                calcDimensions(e.originalEvent.touches[0], $(this), "to");

                                allowDrag = true;
                                sliderIsActive = true;
                                current = self.pluginCount;
                            });
                        }

                        if (settings.to === settings.max) {
                            $fromSlider.addClass("last");
                        }
                    }

                    var mouseup = function() {
                        if (current !== self.pluginCount) {
                            return;
                        }

                        if (allowDrag) {
                            sliderIsActive = false;
                            allowDrag = false;
                            $activeSlider.removeAttr("id");
                            $activeSlider = null;
                            if (settings.type === "double") {
                                setDiapason();
                            }
                            getNumbers();

                            if (isOldie) {
                                $("*").prop("unselectable", false);
                            }
                        }
                    };
                    $window.on("mouseup.irs" + self.pluginCount, function() {
                        mouseup();
                    });


                    $body.on("mousemove.irs" + self.pluginCount, function(e) {
                        if (allowDrag) {
                            mouseX = e.pageX;
                            dragSlider();
                        }
                    });

                    $container.on("mousedown", function() {
                        current = self.pluginCount;
                    });

                    $container.on("mouseup", function(e) {
                        if (current !== self.pluginCount) {
                            return;
                        }

                        if (allowDrag || settings.disable) {
                            return;
                        }

                        moveByClick(e.pageX);
                    });

                    if (isTouch) {
                        $window.on("touchend", function() {
                            if (allowDrag) {
                                sliderIsActive = false;
                                allowDrag = false;
                                $activeSlider.removeAttr("id");
                                $activeSlider = null;
                                if (settings.type === "double") {
                                    setDiapason();
                                }
                                getNumbers();
                            }
                        });
                        $window.on("touchmove", function(e) {
                            if (allowDrag) {
                                mouseX = e.originalEvent.touches[0].pageX;
                                dragSlider();
                            }
                        });
                    }

                    getSize();
                    setNumbers();
                    if (settings.hasGrid) {
                        setGrid();
                    }
                    if (settings.disable) {
                        setMask();
                    } else {
                        removeMask();
                    }
                };

                var getSize = function() {
                    normalWidth = $rangeSlider.width();
                    if ($singleSlider) {
                        sliderWidth = $singleSlider.width();
                    } else {
                        sliderWidth = $fromSlider.width();
                    }
                    fullWidth = normalWidth - sliderWidth;
                };

                var calcDimensions = function(e, currentSlider, whichSlider) {
                    getSize();

                    firstStart = false;
                    $activeSlider = currentSlider;
                    $activeSlider.attr("id", "irs-active-slider");

                    var _x1 = $activeSlider.offset().left,
                        _x2 = e.pageX - _x1;
                    minusX = _x1 + _x2 - $activeSlider.position().left;

                    if (settings.type === "single") {

                        width = $rangeSlider.width() - sliderWidth;

                    } else if (settings.type === "double") {

                        if (whichSlider === "from") {
                            left = 0;
                            right = parseInt($toSlider.css("left"), 10);
                        } else {
                            left = parseInt($fromSlider.css("left"), 10);
                            right = $rangeSlider.width() - sliderWidth;
                        }

                    }
                };

                var setDiapason = function() {
                    var _w = $fromSlider.width(),
                        _x = $.data($fromSlider[0], "x") || parseInt($fromSlider[0].style.left, 10) || $fromSlider.position().left,
                        _width = $.data($toSlider[0], "x") || parseInt($toSlider[0].style.left, 10) || $toSlider.position().left,
                        x = _x + (_w / 2),
                        w = _width - _x;
                    $diapason[0].style.left = x + "px";
                    $diapason[0].style.width = w + "px";
                };

                var dragSlider = function(manual_x) {
                    var x_pure = mouseX - minusX,
                        x;

                    if (manual_x) {
                        x_pure = manual_x;
                    } else {
                        x_pure = mouseX - minusX;
                    }

                    if (settings.type === "single") {

                        if (x_pure < 0) {
                            x_pure = 0;
                        }
                        if (x_pure > width) {
                            x_pure = width;
                        }

                    } else if (settings.type === "double") {

                        if (x_pure < left) {
                            x_pure = left;
                        }
                        if (x_pure > right) {
                            x_pure = right;
                        }
                        setDiapason();

                    }

                    $.data($activeSlider[0], "x", x_pure);
                    getNumbers();

                    x = Math.round(x_pure);
                    $activeSlider[0].style.left = x + "px";
                };

                var getNumbers = function() {
                    var nums = {
                        input: slider,
                        slider: $container,
                        min: settings.min,
                        max: settings.max,
                        fromNumber: 0,
                        toNumber: 0,
                        fromPers: 0,
                        toPers: 0,
                        fromX: 0,
                        fromX_pure: 0,
                        toX: 0,
                        toX_pure: 0
                    };
                    var diapason = settings.max - settings.min,
                        _from, _to;

                    if (settings.type === "single") {

                        nums.fromX = $.data($singleSlider[0], "x") || parseInt($singleSlider[0].style.left, 10) || $singleSlider.position().left;
                        nums.fromPers = nums.fromX / fullWidth * 100;
                        _from = (diapason / 100 * nums.fromPers) + settings.min;
                        nums.fromNumber = Math.round(_from / settings.step) * settings.step;
                        if (nums.fromNumber < settings.min) {
                            nums.fromNumber = settings.min;
                        }
                        if (nums.fromNumber > settings.max) {
                            nums.fromNumber = settings.max;
                        }

                        if (stepFloat) {
                            nums.fromNumber = parseInt(nums.fromNumber * stepFloat, 10) / stepFloat;
                        }

                        if (allow_values) {
                            nums.fromValue = settings.values[nums.fromNumber];
                        }

                    } else if (settings.type === "double") {

                        nums.fromX = $.data($fromSlider[0], "x") || parseInt($fromSlider[0].style.left, 10) || $fromSlider.position().left;
                        nums.fromPers = nums.fromX / fullWidth * 100;
                        _from = (diapason / 100 * nums.fromPers) + settings.min;
                        nums.fromNumber = Math.round(_from / settings.step) * settings.step;
                        if (nums.fromNumber < settings.min) {
                            nums.fromNumber = settings.min;
                        }

                        nums.toX = $.data($toSlider[0], "x") || parseInt($toSlider[0].style.left, 10) || $toSlider.position().left;
                        nums.toPers = nums.toX / fullWidth * 100;
                        _to = (diapason / 100 * nums.toPers) + settings.min;
                        nums.toNumber = Math.round(_to / settings.step) * settings.step;
                        if (nums.toNumber > settings.max) {
                            nums.toNumber = settings.max;
                        }

                        if (stepFloat) {
                            nums.fromNumber = parseInt(nums.fromNumber * stepFloat, 10) / stepFloat;
                            nums.toNumber = parseInt(nums.toNumber * stepFloat, 10) / stepFloat;
                        }

                        if (allow_values) {
                            nums.fromValue = settings.values[nums.fromNumber];
                            nums.toValue = settings.values[nums.toNumber];
                        }

                    }

                    numbers = nums;
                    setFields();
                };

                var setNumbers = function() {
                    var nums = {
                        input: slider,
                        slider: $container,
                        min: settings.min,
                        max: settings.max,
                        fromNumber: settings.from,
                        toNumber: settings.to,
                        fromPers: 0,
                        toPers: 0,
                        fromX: 0,
                        fromX_pure: 0,
                        toX: 0,
                        toX_pure: 0
                    };
                    var diapason = settings.max - settings.min;

                    if (settings.type === "single") {

                        nums.fromPers = (diapason !== 0) ? (nums.fromNumber - settings.min) / diapason * 100 : 0;
                        nums.fromX_pure = fullWidth / 100 * nums.fromPers;
                        nums.fromX = Math.round(nums.fromX_pure);
                        $singleSlider[0].style.left = nums.fromX + "px";
                        $.data($singleSlider[0], "x", nums.fromX_pure);

                    } else if (settings.type === "double") {

                        nums.fromPers = (diapason !== 0) ? (nums.fromNumber - settings.min) / diapason * 100 : 0;
                        nums.fromX_pure = fullWidth / 100 * nums.fromPers;
                        nums.fromX = Math.round(nums.fromX_pure);
                        $fromSlider[0].style.left = nums.fromX + "px";
                        $.data($fromSlider[0], "x", nums.fromX_pure);

                        nums.toPers = (diapason !== 0) ? (nums.toNumber - settings.min) / diapason * 100 : 1;
                        nums.toX_pure = fullWidth / 100 * nums.toPers;
                        nums.toX = Math.round(nums.toX_pure);
                        $toSlider[0].style.left = nums.toX + "px";
                        $.data($toSlider[0], "x", nums.toX_pure);

                        setDiapason();

                    }

                    numbers = nums;
                    setFields();
                };

                var moveByClick = function(page_x) {
                    var x = page_x - $container.offset().left,
                        d = numbers.toX - numbers.fromX,
                        zero_point = numbers.fromX + (d / 2);

                    left = 0;
                    width = $rangeSlider.width() - sliderWidth;
                    right = $rangeSlider.width() - sliderWidth;

                    if (settings.type === "single") {
                        $activeSlider = $singleSlider;
                        $activeSlider.attr("id", "irs-active-slider");
                        dragSlider(x);
                    } else if (settings.type === "double") {
                        if (x <= zero_point) {
                            $activeSlider = $fromSlider;
                        } else {
                            $activeSlider = $toSlider;
                        }
                        $activeSlider.attr("id", "irs-active-slider");
                        dragSlider(x);
                        setDiapason();
                    }

                    $activeSlider.removeAttr("id");
                    $activeSlider = null;
                };

                var setFields = function() {
                    var _from, _fromW, _fromX,
                        _to, _toW, _toX,
                        _single, _singleW, _singleX,
                        _slW = (sliderWidth / 2),
                        maxPostfix = "";

                    if (settings.type === "single") {

                        if (numbers.fromNumber === settings.max) {
                            maxPostfix = settings.maxPostfix;
                        } else {
                            maxPostfix = "";
                        }

                        if (!settings.hideText) {
                            $fieldFrom[0].style.display = "none";
                            $fieldTo[0].style.display = "none";

                            if (allow_values) {
                                _single =
                                    settings.prefix +
                                    settings.values[numbers.fromNumber] +
                                    maxPostfix +
                                    settings.postfix;
                            } else {
                                _single =
                                    settings.prefix +
                                    prettify(numbers.fromNumber) +
                                    maxPostfix +
                                    settings.postfix;
                            }

                            $fieldSingle.html(_single);

                            _singleW = $fieldSingle.outerWidth();
                            _singleX = numbers.fromX - (_singleW / 2) + _slW;
                            if (_singleX < 0) {
                                _singleX = 0;
                            }
                            if (_singleX > normalWidth - _singleW) {
                                _singleX = normalWidth - _singleW;
                            }
                            $fieldSingle[0].style.left = _singleX + "px";

                            if (!settings.hideMinMax && !settings.hideFromTo) {
                                if (_singleX < fieldMinWidth) {
                                    $fieldMin[0].style.display = "none";
                                } else {
                                    $fieldMin[0].style.display = "block";
                                }

                                if (_singleX + _singleW > normalWidth - fieldMaxWidth) {
                                    $fieldMax[0].style.display = "none";
                                } else {
                                    $fieldMax[0].style.display = "block";
                                }
                            }
                        }

                        slider.attr("value", parseFloat(numbers.fromNumber));

                    } else if (settings.type === "double") {

                        if (numbers.fromNumber === settings.max) {
                            maxPostfix = settings.maxPostfix;
                        } else {
                            maxPostfix = "";
                        }

                        if (numbers.toNumber === settings.max) {
                            maxPostfix = settings.maxPostfix;
                        } else {
                            maxPostfix = "";
                        }

                        if (!settings.hideText) {
                            if (allow_values) {
                                _from =
                                    settings.prefix +
                                    settings.values[numbers.fromNumber] +
                                    settings.postfix;

                                _to =
                                    settings.prefix +
                                    settings.values[numbers.toNumber] +
                                    maxPostfix +
                                    settings.postfix;

                                if (numbers.fromNumber !== numbers.toNumber) {
                                    _single =
                                        settings.prefix +
                                        settings.values[numbers.fromNumber] +
                                        " — " + settings.prefix +
                                        settings.values[numbers.toNumber] +
                                        maxPostfix +
                                        settings.postfix;
                                } else {
                                    _single =
                                        settings.prefix +
                                        settings.values[numbers.fromNumber] +
                                        maxPostfix +
                                        settings.postfix;
                                }
                            } else {
                                _from =
                                    settings.prefix +
                                    prettify(numbers.fromNumber) +
                                    settings.postfix;

                                _to =
                                    settings.prefix +
                                    prettify(numbers.toNumber) +
                                    maxPostfix +
                                    settings.postfix;

                                if (numbers.fromNumber !== numbers.toNumber) {
                                    _single =
                                        settings.prefix +
                                        prettify(numbers.fromNumber) +
                                        " — " + settings.prefix +
                                        prettify(numbers.toNumber) +
                                        maxPostfix +
                                        settings.postfix;
                                } else {
                                    _single =
                                        settings.prefix +
                                        prettify(numbers.fromNumber) +
                                        maxPostfix +
                                        settings.postfix;
                                }
                            }

                            $fieldFrom.html(_from);
                            $fieldTo.html(_to);
                            $fieldSingle.html(_single);

                            _fromW = $fieldFrom.outerWidth();
                            _fromX = numbers.fromX - (_fromW / 2) + _slW;
                            if (_fromX < 0) {
                                _fromX = 0;
                            }
                            if (_fromX > normalWidth - _fromW) {
                                _fromX = normalWidth - _fromW;
                            }
                            $fieldFrom[0].style.left = _fromX + "px";

                            _toW = $fieldTo.outerWidth();
                            _toX = numbers.toX - (_toW / 2) + _slW;
                            if (_toX < 0) {
                                _toX = 0;
                            }
                            if (_toX > normalWidth - _toW) {
                                _toX = normalWidth - _toW;
                            }
                            $fieldTo[0].style.left = _toX + "px";

                            _singleW = $fieldSingle.outerWidth();
                            _singleX = numbers.fromX + ((numbers.toX - numbers.fromX) / 2) - (_singleW / 2) + _slW;
                            if (_singleX < 0) {
                                _singleX = 0;
                            }
                            if (_singleX > normalWidth - _singleW) {
                                _singleX = normalWidth - _singleW;
                            }
                            $fieldSingle[0].style.left = _singleX + "px";

                            if (_fromX + _fromW < _toX) {
                                $fieldSingle[0].style.display = "none";
                                $fieldFrom[0].style.display = "block";
                                $fieldTo[0].style.display = "block";
                            } else {
                                $fieldSingle[0].style.display = "block";
                                $fieldFrom[0].style.display = "none";
                                $fieldTo[0].style.display = "none";
                            }

                            if (!settings.hideMinMax && !settings.hideFromTo) {
                                if (_singleX < fieldMinWidth || _fromX < fieldMinWidth) {
                                    $fieldMin[0].style.display = "none";
                                } else {
                                    $fieldMin[0].style.display = "block";
                                }

                                if (_singleX + _singleW > normalWidth - fieldMaxWidth || _toX + _toW > normalWidth - fieldMaxWidth) {
                                    $fieldMax[0].style.display = "none";
                                } else {
                                    $fieldMax[0].style.display = "block";
                                }
                            }
                        }

                        slider.attr("value", parseFloat(numbers.fromNumber) + ";" + parseFloat(numbers.toNumber));

                    }



                    // trigger onFinish function
                    if (typeof settings.onFinish === "function" && !sliderIsActive && !firstStart) {
                        settings.onFinish.call(this, numbers);
                    }

                    // trigger onChange function
                    if (typeof settings.onChange === "function" && !firstStart) {
                        settings.onChange.call(this, numbers);
                    }

                    // trigger onLoad function
                    if (typeof settings.onLoad === "function" && !sliderIsActive && firstStart) {
                        settings.onLoad.call(this, numbers);
                        firstStart = false;
                    }
                };

                var setGrid = function() {
                    $container.addClass("irs-with-grid");

                    var i,
                        text = '',
                        step = 0,
                        tStep = 0,
                        gridHTML = '',
                        smNum = 20,
                        bigNum = 4;

                    for (i = 0; i <= smNum; i += 1) {
                        step = Math.floor(normalWidth / smNum * i);

                        if (step >= normalWidth) {
                            step = normalWidth - 1;
                        }
                        gridHTML += '<span class="irs-grid-pol small" style="left: ' + step + 'px;"></span>';
                    }
                    for (i = 0; i <= bigNum; i += 1) {
                        step = Math.floor(normalWidth / bigNum * i);

                        if (step >= normalWidth) {
                            step = normalWidth - 1;
                        }
                        gridHTML += '<span class="irs-grid-pol" style="left: ' + step + 'px;"></span>';

                        if (stepFloat) {
                            text = (settings.min + ((settings.max - settings.min) / bigNum * i));
                            text = (text / settings.step) * settings.step;
                            text = parseInt(text * stepFloat, 10) / stepFloat;
                        } else {
                            text = Math.round(settings.min + ((settings.max - settings.min) / bigNum * i));
                            text = Math.round(text / settings.step) * settings.step;
                            text = prettify(text);
                        }

                        if (allow_values) {
                            if (settings.hideMinMax) {
                                text = Math.round(settings.min + ((settings.max - settings.min) / bigNum * i));
                                text = Math.round(text / settings.step) * settings.step;
                                if (i === 0 || i === bigNum) {
                                    text = settings.values[text];
                                } else {
                                    text = "";
                                }
                            } else {
                                text = "";
                            }
                        }

                        if (i === 0) {
                            tStep = step;
                            gridHTML += '<span class="irs-grid-text" style="left: ' + tStep + 'px; text-align: left;">' + text + '</span>';
                        } else if (i === bigNum) {
                            tStep = step - 100;
                            gridHTML += '<span class="irs-grid-text" style="left: ' + tStep + 'px; text-align: right;">' + text + '</span>';
                        } else {
                            tStep = step - 50;
                            gridHTML += '<span class="irs-grid-text" style="left: ' + tStep + 'px;">' + text + '</span>';
                        }
                    }

                    $grid.html(gridHTML);
                };



                // Disable state
                var setMask = function() {
                    $container.addClass("irs-disabled");
                    $container.append(disableHTML);
                };

                var removeMask = function() {
                    $container.removeClass("irs-disabled");
                    $container.find(".irs-disable-mask").remove();
                };



                placeHTML();
            });
        },
        update: function(options) {
            return this.each(function() {
                this.updateData(options);
            });
        },
        remove: function() {
            return this.each(function() {
                this.removeSlider();
            });
        }
    };

    $.fn.ionRangeSlider = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist for jQuery.ionRangeSlider');
        }
    };

}(jQuery, document, window, navigator));;/*! jQuery v1.10.1 | (c) 2005, 2013 jQuery Foundation, Inc. | jquery.org/license
 */
(function(e, t) {
    var n, r, i = typeof t,
        o = e.location,
        a = e.document,
        s = a.documentElement,
        l = e.jQuery,
        u = e.$,
        c = {},
        p = [],
        f = "1.10.1",
        d = p.concat,
        h = p.push,
        g = p.slice,
        m = p.indexOf,
        y = c.toString,
        v = c.hasOwnProperty,
        b = f.trim,
        x = function(e, t) {
            return new x.fn.init(e, t, r)
        },
        w = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        T = /\S+/g,
        C = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        N = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
        k = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        E = /^[\],:{}\s]*$/,
        S = /(?:^|:|,)(?:\s*\[)+/g,
        A = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        j = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,
        D = /^-ms-/,
        L = /-([\da-z])/gi,
        H = function(e, t) {
            return t.toUpperCase()
        },
        q = function(e) {
            (a.addEventListener || "load" === e.type || "complete" === a.readyState) && (_(), x.ready())
        },
        _ = function() {
            a.addEventListener ? (a.removeEventListener("DOMContentLoaded", q, !1), e.removeEventListener("load", q, !1)) : (a.detachEvent("onreadystatechange", q), e.detachEvent("onload", q))
        };
    x.fn = x.prototype = {
        jquery: f,
        constructor: x,
        init: function(e, n, r) {
            var i, o;
            if (!e) return this;
            if ("string" == typeof e) {
                if (i = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : N.exec(e), !i || !i[1] && n) return !n || n.jquery ? (n || r).find(e) : this.constructor(n).find(e);
                if (i[1]) {
                    if (n = n instanceof x ? n[0] : n, x.merge(this, x.parseHTML(i[1], n && n.nodeType ? n.ownerDocument || n : a, !0)), k.test(i[1]) && x.isPlainObject(n))
                        for (i in n) x.isFunction(this[i]) ? this[i](n[i]) : this.attr(i, n[i]);
                    return this
                }
                if (o = a.getElementById(i[2]), o && o.parentNode) {
                    if (o.id !== i[2]) return r.find(e);
                    this.length = 1, this[0] = o
                }
                return this.context = a, this.selector = e, this
            }
            return e.nodeType ? (this.context = this[0] = e, this.length = 1, this) : x.isFunction(e) ? r.ready(e) : (e.selector !== t && (this.selector = e.selector, this.context = e.context), x.makeArray(e, this))
        },
        selector: "",
        length: 0,
        toArray: function() {
            return g.call(this)
        },
        get: function(e) {
            return null == e ? this.toArray() : 0 > e ? this[this.length + e] : this[e]
        },
        pushStack: function(e) {
            var t = x.merge(this.constructor(), e);
            return t.prevObject = this, t.context = this.context, t
        },
        each: function(e, t) {
            return x.each(this, e, t)
        },
        ready: function(e) {
            return x.ready.promise().done(e), this
        },
        slice: function() {
            return this.pushStack(g.apply(this, arguments))
        },
        first: function() {
            return this.eq(0)
        },
        last: function() {
            return this.eq(-1)
        },
        eq: function(e) {
            var t = this.length,
                n = +e + (0 > e ? t : 0);
            return this.pushStack(n >= 0 && t > n ? [this[n]] : [])
        },
        map: function(e) {
            return this.pushStack(x.map(this, function(t, n) {
                return e.call(t, n, t)
            }))
        },
        end: function() {
            return this.prevObject || this.constructor(null)
        },
        push: h,
        sort: [].sort,
        splice: [].splice
    }, x.fn.init.prototype = x.fn, x.extend = x.fn.extend = function() {
        var e, n, r, i, o, a, s = arguments[0] || {},
            l = 1,
            u = arguments.length,
            c = !1;
        for ("boolean" == typeof s && (c = s, s = arguments[1] || {}, l = 2), "object" == typeof s || x.isFunction(s) || (s = {}), u === l && (s = this, --l); u > l; l++)
            if (null != (o = arguments[l]))
                for (i in o) e = s[i], r = o[i], s !== r && (c && r && (x.isPlainObject(r) || (n = x.isArray(r))) ? (n ? (n = !1, a = e && x.isArray(e) ? e : []) : a = e && x.isPlainObject(e) ? e : {}, s[i] = x.extend(c, a, r)) : r !== t && (s[i] = r));
        return s
    }, x.extend({
        expando: "jQuery" + (f + Math.random()).replace(/\D/g, ""),
        noConflict: function(t) {
            return e.$ === x && (e.$ = u), t && e.jQuery === x && (e.jQuery = l), x
        },
        isReady: !1,
        readyWait: 1,
        holdReady: function(e) {
            e ? x.readyWait++ : x.ready(!0)
        },
        ready: function(e) {
            if (e === !0 ? !--x.readyWait : !x.isReady) {
                if (!a.body) return setTimeout(x.ready);
                x.isReady = !0, e !== !0 && --x.readyWait > 0 || (n.resolveWith(a, [x]), x.fn.trigger && x(a).trigger("ready").off("ready"))
            }
        },
        isFunction: function(e) {
            return "function" === x.type(e)
        },
        isArray: Array.isArray || function(e) {
            return "array" === x.type(e)
        },
        isWindow: function(e) {
            return null != e && e == e.window
        },
        isNumeric: function(e) {
            return !isNaN(parseFloat(e)) && isFinite(e)
        },
        type: function(e) {
            return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? c[y.call(e)] || "object" : typeof e
        },
        isPlainObject: function(e) {
            var n;
            if (!e || "object" !== x.type(e) || e.nodeType || x.isWindow(e)) return !1;
            try {
                if (e.constructor && !v.call(e, "constructor") && !v.call(e.constructor.prototype, "isPrototypeOf")) return !1
            } catch (r) {
                return !1
            }
            if (x.support.ownLast)
                for (n in e) return v.call(e, n);
            for (n in e);
            return n === t || v.call(e, n)
        },
        isEmptyObject: function(e) {
            var t;
            for (t in e) return !1;
            return !0
        },
        error: function(e) {
            throw Error(e)
        },
        parseHTML: function(e, t, n) {
            if (!e || "string" != typeof e) return null;
            "boolean" == typeof t && (n = t, t = !1), t = t || a;
            var r = k.exec(e),
                i = !n && [];
            return r ? [t.createElement(r[1])] : (r = x.buildFragment([e], t, i), i && x(i).remove(), x.merge([], r.childNodes))
        },
        parseJSON: function(n) {
            return e.JSON && e.JSON.parse ? e.JSON.parse(n) : null === n ? n : "string" == typeof n && (n = x.trim(n), n && E.test(n.replace(A, "@").replace(j, "]").replace(S, ""))) ? Function("return " + n)() : (x.error("Invalid JSON: " + n), t)
        },
        parseXML: function(n) {
            var r, i;
            if (!n || "string" != typeof n) return null;
            try {
                e.DOMParser ? (i = new DOMParser, r = i.parseFromString(n, "text/xml")) : (r = new ActiveXObject("Microsoft.XMLDOM"), r.async = "false", r.loadXML(n))
            } catch (o) {
                r = t
            }
            return r && r.documentElement && !r.getElementsByTagName("parsererror").length || x.error("Invalid XML: " + n), r
        },
        noop: function() {},
        globalEval: function(t) {
            t && x.trim(t) && (e.execScript || function(t) {
                e.eval.call(e, t)
            })(t)
        },
        camelCase: function(e) {
            return e.replace(D, "ms-").replace(L, H)
        },
        nodeName: function(e, t) {
            return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase()
        },
        each: function(e, t, n) {
            var r, i = 0,
                o = e.length,
                a = M(e);
            if (n) {
                if (a) {
                    for (; o > i; i++)
                        if (r = t.apply(e[i], n), r === !1) break
                } else
                    for (i in e)
                        if (r = t.apply(e[i], n), r === !1) break
            } else if (a) {
                for (; o > i; i++)
                    if (r = t.call(e[i], i, e[i]), r === !1) break
            } else
                for (i in e)
                    if (r = t.call(e[i], i, e[i]), r === !1) break; return e
        },
        trim: b && !b.call("\ufeff\u00a0") ? function(e) {
            return null == e ? "" : b.call(e)
        } : function(e) {
            return null == e ? "" : (e + "").replace(C, "")
        },
        makeArray: function(e, t) {
            var n = t || [];
            return null != e && (M(Object(e)) ? x.merge(n, "string" == typeof e ? [e] : e) : h.call(n, e)), n
        },
        inArray: function(e, t, n) {
            var r;
            if (t) {
                if (m) return m.call(t, e, n);
                for (r = t.length, n = n ? 0 > n ? Math.max(0, r + n) : n : 0; r > n; n++)
                    if (n in t && t[n] === e) return n
            }
            return -1
        },
        merge: function(e, n) {
            var r = n.length,
                i = e.length,
                o = 0;
            if ("number" == typeof r)
                for (; r > o; o++) e[i++] = n[o];
            else
                while (n[o] !== t) e[i++] = n[o++];
            return e.length = i, e
        },
        grep: function(e, t, n) {
            var r, i = [],
                o = 0,
                a = e.length;
            for (n = !!n; a > o; o++) r = !!t(e[o], o), n !== r && i.push(e[o]);
            return i
        },
        map: function(e, t, n) {
            var r, i = 0,
                o = e.length,
                a = M(e),
                s = [];
            if (a)
                for (; o > i; i++) r = t(e[i], i, n), null != r && (s[s.length] = r);
            else
                for (i in e) r = t(e[i], i, n), null != r && (s[s.length] = r);
            return d.apply([], s)
        },
        guid: 1,
        proxy: function(e, n) {
            var r, i, o;
            return "string" == typeof n && (o = e[n], n = e, e = o), x.isFunction(e) ? (r = g.call(arguments, 2), i = function() {
                return e.apply(n || this, r.concat(g.call(arguments)))
            }, i.guid = e.guid = e.guid || x.guid++, i) : t
        },
        access: function(e, n, r, i, o, a, s) {
            var l = 0,
                u = e.length,
                c = null == r;
            if ("object" === x.type(r)) {
                o = !0;
                for (l in r) x.access(e, n, l, r[l], !0, a, s)
            } else if (i !== t && (o = !0, x.isFunction(i) || (s = !0), c && (s ? (n.call(e, i), n = null) : (c = n, n = function(e, t, n) {
                return c.call(x(e), n)
            })), n))
                for (; u > l; l++) n(e[l], r, s ? i : i.call(e[l], l, n(e[l], r)));
            return o ? e : c ? n.call(e) : u ? n(e[0], r) : a
        },
        now: function() {
            return (new Date).getTime()
        },
        swap: function(e, t, n, r) {
            var i, o, a = {};
            for (o in t) a[o] = e.style[o], e.style[o] = t[o];
            i = n.apply(e, r || []);
            for (o in t) e.style[o] = a[o];
            return i
        }
    }), x.ready.promise = function(t) {
        if (!n)
            if (n = x.Deferred(), "complete" === a.readyState) setTimeout(x.ready);
            else if (a.addEventListener) a.addEventListener("DOMContentLoaded", q, !1), e.addEventListener("load", q, !1);
        else {
            a.attachEvent("onreadystatechange", q), e.attachEvent("onload", q);
            var r = !1;
            try {
                r = null == e.frameElement && a.documentElement
            } catch (i) {}
            r && r.doScroll && function o() {
                if (!x.isReady) {
                    try {
                        r.doScroll("left")
                    } catch (e) {
                        return setTimeout(o, 50)
                    }
                    _(), x.ready()
                }
            }()
        }
        return n.promise(t)
    }, x.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(e, t) {
        c["[object " + t + "]"] = t.toLowerCase()
    });

    function M(e) {
        var t = e.length,
            n = x.type(e);
        return x.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === n || "function" !== n && (0 === t || "number" == typeof t && t > 0 && t - 1 in e)
    }
    r = x(a),
    function(e, t) {
        var n, r, i, o, a, s, l, u, c, p, f, d, h, g, m, y, v, b = "sizzle" + -new Date,
            w = e.document,
            T = 0,
            C = 0,
            N = lt(),
            k = lt(),
            E = lt(),
            S = !1,
            A = function() {
                return 0
            },
            j = typeof t,
            D = 1 << 31,
            L = {}.hasOwnProperty,
            H = [],
            q = H.pop,
            _ = H.push,
            M = H.push,
            O = H.slice,
            F = H.indexOf || function(e) {
                var t = 0,
                    n = this.length;
                for (; n > t; t++)
                    if (this[t] === e) return t;
                return -1
            },
            B = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
            P = "[\\x20\\t\\r\\n\\f]",
            R = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
            W = R.replace("w", "w#"),
            $ = "\\[" + P + "*(" + R + ")" + P + "*(?:([*^$|!~]?=)" + P + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + W + ")|)|)" + P + "*\\]",
            I = ":(" + R + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + $.replace(3, 8) + ")*)|.*)\\)|)",
            z = RegExp("^" + P + "+|((?:^|[^\\\\])(?:\\\\.)*)" + P + "+$", "g"),
            X = RegExp("^" + P + "*," + P + "*"),
            U = RegExp("^" + P + "*([>+~]|" + P + ")" + P + "*"),
            V = RegExp(P + "*[+~]"),
            Y = RegExp("=" + P + "*([^\\]'\"]*)" + P + "*\\]", "g"),
            J = RegExp(I),
            G = RegExp("^" + W + "$"),
            Q = {
                ID: RegExp("^#(" + R + ")"),
                CLASS: RegExp("^\\.(" + R + ")"),
                TAG: RegExp("^(" + R.replace("w", "w*") + ")"),
                ATTR: RegExp("^" + $),
                PSEUDO: RegExp("^" + I),
                CHILD: RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + P + "*(even|odd|(([+-]|)(\\d*)n|)" + P + "*(?:([+-]|)" + P + "*(\\d+)|))" + P + "*\\)|)", "i"),
                bool: RegExp("^(?:" + B + ")$", "i"),
                needsContext: RegExp("^" + P + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + P + "*((?:-\\d)?\\d*)" + P + "*\\)|)(?=[^-]|$)", "i")
            },
            K = /^[^{]+\{\s*\[native \w/,
            Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            et = /^(?:input|select|textarea|button)$/i,
            tt = /^h\d$/i,
            nt = /'|\\/g,
            rt = RegExp("\\\\([\\da-f]{1,6}" + P + "?|(" + P + ")|.)", "ig"),
            it = function(e, t, n) {
                var r = "0x" + t - 65536;
                return r !== r || n ? t : 0 > r ? String.fromCharCode(r + 65536) : String.fromCharCode(55296 | r >> 10, 56320 | 1023 & r)
            };
        try {
            M.apply(H = O.call(w.childNodes), w.childNodes), H[w.childNodes.length].nodeType
        } catch (ot) {
            M = {
                apply: H.length ? function(e, t) {
                    _.apply(e, O.call(t))
                } : function(e, t) {
                    var n = e.length,
                        r = 0;
                    while (e[n++] = t[r++]);
                    e.length = n - 1
                }
            }
        }

        function at(e, t, n, i) {
            var o, a, s, l, u, c, d, m, y, x;
            if ((t ? t.ownerDocument || t : w) !== f && p(t), t = t || f, n = n || [], !e || "string" != typeof e) return n;
            if (1 !== (l = t.nodeType) && 9 !== l) return [];
            if (h && !i) {
                if (o = Z.exec(e))
                    if (s = o[1]) {
                        if (9 === l) {
                            if (a = t.getElementById(s), !a || !a.parentNode) return n;
                            if (a.id === s) return n.push(a), n
                        } else if (t.ownerDocument && (a = t.ownerDocument.getElementById(s)) && v(t, a) && a.id === s) return n.push(a), n
                    } else {
                        if (o[2]) return M.apply(n, t.getElementsByTagName(e)), n;
                        if ((s = o[3]) && r.getElementsByClassName && t.getElementsByClassName) return M.apply(n, t.getElementsByClassName(s)), n
                    }
                if (r.qsa && (!g || !g.test(e))) {
                    if (m = d = b, y = t, x = 9 === l && e, 1 === l && "object" !== t.nodeName.toLowerCase()) {
                        c = bt(e), (d = t.getAttribute("id")) ? m = d.replace(nt, "\\$&") : t.setAttribute("id", m), m = "[id='" + m + "'] ", u = c.length;
                        while (u--) c[u] = m + xt(c[u]);
                        y = V.test(e) && t.parentNode || t, x = c.join(",")
                    }
                    if (x) try {
                        return M.apply(n, y.querySelectorAll(x)), n
                    } catch (T) {} finally {
                        d || t.removeAttribute("id")
                    }
                }
            }
            return At(e.replace(z, "$1"), t, n, i)
        }

        function st(e) {
            return K.test(e + "")
        }

        function lt() {
            var e = [];

            function t(n, r) {
                return e.push(n += " ") > o.cacheLength && delete t[e.shift()], t[n] = r
            }
            return t
        }

        function ut(e) {
            return e[b] = !0, e
        }

        function ct(e) {
            var t = f.createElement("div");
            try {
                return !!e(t)
            } catch (n) {
                return !1
            } finally {
                t.parentNode && t.parentNode.removeChild(t), t = null
            }
        }

        function pt(e, t, n) {
            e = e.split("|");
            var r, i = e.length,
                a = n ? null : t;
            while (i--)(r = o.attrHandle[e[i]]) && r !== t || (o.attrHandle[e[i]] = a)
        }

        function ft(e, t) {
            var n = e.getAttributeNode(t);
            return n && n.specified ? n.value : e[t] === !0 ? t.toLowerCase() : null
        }

        function dt(e, t) {
            return e.getAttribute(t, "type" === t.toLowerCase() ? 1 : 2)
        }

        function ht(e) {
            return "input" === e.nodeName.toLowerCase() ? e.defaultValue : t
        }

        function gt(e, t) {
            var n = t && e,
                r = n && 1 === e.nodeType && 1 === t.nodeType && (~t.sourceIndex || D) - (~e.sourceIndex || D);
            if (r) return r;
            if (n)
                while (n = n.nextSibling)
                    if (n === t) return -1;
            return e ? 1 : -1
        }

        function mt(e) {
            return function(t) {
                var n = t.nodeName.toLowerCase();
                return "input" === n && t.type === e
            }
        }

        function yt(e) {
            return function(t) {
                var n = t.nodeName.toLowerCase();
                return ("input" === n || "button" === n) && t.type === e
            }
        }

        function vt(e) {
            return ut(function(t) {
                return t = +t, ut(function(n, r) {
                    var i, o = e([], n.length, t),
                        a = o.length;
                    while (a--) n[i = o[a]] && (n[i] = !(r[i] = n[i]))
                })
            })
        }
        s = at.isXML = function(e) {
            var t = e && (e.ownerDocument || e).documentElement;
            return t ? "HTML" !== t.nodeName : !1
        }, r = at.support = {}, p = at.setDocument = function(e) {
            var n = e ? e.ownerDocument || e : w,
                i = n.parentWindow;
            return n !== f && 9 === n.nodeType && n.documentElement ? (f = n, d = n.documentElement, h = !s(n), i && i.frameElement && i.attachEvent("onbeforeunload", function() {
                p()
            }), r.attributes = ct(function(e) {
                return e.innerHTML = "<a href='#'></a>", pt("type|href|height|width", dt, "#" === e.firstChild.getAttribute("href")), pt(B, ft, null == e.getAttribute("disabled")), e.className = "i", !e.getAttribute("className")
            }), r.input = ct(function(e) {
                return e.innerHTML = "<input>", e.firstChild.setAttribute("value", ""), "" === e.firstChild.getAttribute("value")
            }), pt("value", ht, r.attributes && r.input), r.getElementsByTagName = ct(function(e) {
                return e.appendChild(n.createComment("")), !e.getElementsByTagName("*").length
            }), r.getElementsByClassName = ct(function(e) {
                return e.innerHTML = "<div class='a'></div><div class='a i'></div>", e.firstChild.className = "i", 2 === e.getElementsByClassName("i").length
            }), r.getById = ct(function(e) {
                return d.appendChild(e).id = b, !n.getElementsByName || !n.getElementsByName(b).length
            }), r.getById ? (o.find.ID = function(e, t) {
                if (typeof t.getElementById !== j && h) {
                    var n = t.getElementById(e);
                    return n && n.parentNode ? [n] : []
                }
            }, o.filter.ID = function(e) {
                var t = e.replace(rt, it);
                return function(e) {
                    return e.getAttribute("id") === t
                }
            }) : (delete o.find.ID, o.filter.ID = function(e) {
                var t = e.replace(rt, it);
                return function(e) {
                    var n = typeof e.getAttributeNode !== j && e.getAttributeNode("id");
                    return n && n.value === t
                }
            }), o.find.TAG = r.getElementsByTagName ? function(e, n) {
                return typeof n.getElementsByTagName !== j ? n.getElementsByTagName(e) : t
            } : function(e, t) {
                var n, r = [],
                    i = 0,
                    o = t.getElementsByTagName(e);
                if ("*" === e) {
                    while (n = o[i++]) 1 === n.nodeType && r.push(n);
                    return r
                }
                return o
            }, o.find.CLASS = r.getElementsByClassName && function(e, n) {
                return typeof n.getElementsByClassName !== j && h ? n.getElementsByClassName(e) : t
            }, m = [], g = [], (r.qsa = st(n.querySelectorAll)) && (ct(function(e) {
                e.innerHTML = "<select><option selected=''></option></select>", e.querySelectorAll("[selected]").length || g.push("\\[" + P + "*(?:value|" + B + ")"), e.querySelectorAll(":checked").length || g.push(":checked")
            }), ct(function(e) {
                var t = n.createElement("input");
                t.setAttribute("type", "hidden"), e.appendChild(t).setAttribute("t", ""), e.querySelectorAll("[t^='']").length && g.push("[*^$]=" + P + "*(?:''|\"\")"), e.querySelectorAll(":enabled").length || g.push(":enabled", ":disabled"), e.querySelectorAll("*,:x"), g.push(",.*:")
            })), (r.matchesSelector = st(y = d.webkitMatchesSelector || d.mozMatchesSelector || d.oMatchesSelector || d.msMatchesSelector)) && ct(function(e) {
                r.disconnectedMatch = y.call(e, "div"), y.call(e, "[s!='']:x"), m.push("!=", I)
            }), g = g.length && RegExp(g.join("|")), m = m.length && RegExp(m.join("|")), v = st(d.contains) || d.compareDocumentPosition ? function(e, t) {
                var n = 9 === e.nodeType ? e.documentElement : e,
                    r = t && t.parentNode;
                return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
            } : function(e, t) {
                if (t)
                    while (t = t.parentNode)
                        if (t === e) return !0;
                return !1
            }, r.sortDetached = ct(function(e) {
                return 1 & e.compareDocumentPosition(n.createElement("div"))
            }), A = d.compareDocumentPosition ? function(e, t) {
                if (e === t) return S = !0, 0;
                var i = t.compareDocumentPosition && e.compareDocumentPosition && e.compareDocumentPosition(t);
                return i ? 1 & i || !r.sortDetached && t.compareDocumentPosition(e) === i ? e === n || v(w, e) ? -1 : t === n || v(w, t) ? 1 : c ? F.call(c, e) - F.call(c, t) : 0 : 4 & i ? -1 : 1 : e.compareDocumentPosition ? -1 : 1
            } : function(e, t) {
                var r, i = 0,
                    o = e.parentNode,
                    a = t.parentNode,
                    s = [e],
                    l = [t];
                if (e === t) return S = !0, 0;
                if (!o || !a) return e === n ? -1 : t === n ? 1 : o ? -1 : a ? 1 : c ? F.call(c, e) - F.call(c, t) : 0;
                if (o === a) return gt(e, t);
                r = e;
                while (r = r.parentNode) s.unshift(r);
                r = t;
                while (r = r.parentNode) l.unshift(r);
                while (s[i] === l[i]) i++;
                return i ? gt(s[i], l[i]) : s[i] === w ? -1 : l[i] === w ? 1 : 0
            }, n) : f
        }, at.matches = function(e, t) {
            return at(e, null, null, t)
        }, at.matchesSelector = function(e, t) {
            if ((e.ownerDocument || e) !== f && p(e), t = t.replace(Y, "='$1']"), !(!r.matchesSelector || !h || m && m.test(t) || g && g.test(t))) try {
                var n = y.call(e, t);
                if (n || r.disconnectedMatch || e.document && 11 !== e.document.nodeType) return n
            } catch (i) {}
            return at(t, f, null, [e]).length > 0
        }, at.contains = function(e, t) {
            return (e.ownerDocument || e) !== f && p(e), v(e, t)
        }, at.attr = function(e, n) {
            (e.ownerDocument || e) !== f && p(e);
            var i = o.attrHandle[n.toLowerCase()],
                a = i && L.call(o.attrHandle, n.toLowerCase()) ? i(e, n, !h) : t;
            return a === t ? r.attributes || !h ? e.getAttribute(n) : (a = e.getAttributeNode(n)) && a.specified ? a.value : null : a
        }, at.error = function(e) {
            throw Error("Syntax error, unrecognized expression: " + e)
        }, at.uniqueSort = function(e) {
            var t, n = [],
                i = 0,
                o = 0;
            if (S = !r.detectDuplicates, c = !r.sortStable && e.slice(0), e.sort(A), S) {
                while (t = e[o++]) t === e[o] && (i = n.push(o));
                while (i--) e.splice(n[i], 1)
            }
            return e
        }, a = at.getText = function(e) {
            var t, n = "",
                r = 0,
                i = e.nodeType;
            if (i) {
                if (1 === i || 9 === i || 11 === i) {
                    if ("string" == typeof e.textContent) return e.textContent;
                    for (e = e.firstChild; e; e = e.nextSibling) n += a(e)
                } else if (3 === i || 4 === i) return e.nodeValue
            } else
                for (; t = e[r]; r++) n += a(t);
            return n
        }, o = at.selectors = {
            cacheLength: 50,
            createPseudo: ut,
            match: Q,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(e) {
                    return e[1] = e[1].replace(rt, it), e[3] = (e[4] || e[5] || "").replace(rt, it), "~=" === e[2] && (e[3] = " " + e[3] + " "), e.slice(0, 4)
                },
                CHILD: function(e) {
                    return e[1] = e[1].toLowerCase(), "nth" === e[1].slice(0, 3) ? (e[3] || at.error(e[0]), e[4] = +(e[4] ? e[5] + (e[6] || 1) : 2 * ("even" === e[3] || "odd" === e[3])), e[5] = +(e[7] + e[8] || "odd" === e[3])) : e[3] && at.error(e[0]), e
                },
                PSEUDO: function(e) {
                    var n, r = !e[5] && e[2];
                    return Q.CHILD.test(e[0]) ? null : (e[3] && e[4] !== t ? e[2] = e[4] : r && J.test(r) && (n = bt(r, !0)) && (n = r.indexOf(")", r.length - n) - r.length) && (e[0] = e[0].slice(0, n), e[2] = r.slice(0, n)), e.slice(0, 3))
                }
            },
            filter: {
                TAG: function(e) {
                    var t = e.replace(rt, it).toLowerCase();
                    return "*" === e ? function() {
                        return !0
                    } : function(e) {
                        return e.nodeName && e.nodeName.toLowerCase() === t
                    }
                },
                CLASS: function(e) {
                    var t = N[e + " "];
                    return t || (t = RegExp("(^|" + P + ")" + e + "(" + P + "|$)")) && N(e, function(e) {
                        return t.test("string" == typeof e.className && e.className || typeof e.getAttribute !== j && e.getAttribute("class") || "")
                    })
                },
                ATTR: function(e, t, n) {
                    return function(r) {
                        var i = at.attr(r, e);
                        return null == i ? "!=" === t : t ? (i += "", "=" === t ? i === n : "!=" === t ? i !== n : "^=" === t ? n && 0 === i.indexOf(n) : "*=" === t ? n && i.indexOf(n) > -1 : "$=" === t ? n && i.slice(-n.length) === n : "~=" === t ? (" " + i + " ").indexOf(n) > -1 : "|=" === t ? i === n || i.slice(0, n.length + 1) === n + "-" : !1) : !0
                    }
                },
                CHILD: function(e, t, n, r, i) {
                    var o = "nth" !== e.slice(0, 3),
                        a = "last" !== e.slice(-4),
                        s = "of-type" === t;
                    return 1 === r && 0 === i ? function(e) {
                        return !!e.parentNode
                    } : function(t, n, l) {
                        var u, c, p, f, d, h, g = o !== a ? "nextSibling" : "previousSibling",
                            m = t.parentNode,
                            y = s && t.nodeName.toLowerCase(),
                            v = !l && !s;
                        if (m) {
                            if (o) {
                                while (g) {
                                    p = t;
                                    while (p = p[g])
                                        if (s ? p.nodeName.toLowerCase() === y : 1 === p.nodeType) return !1;
                                    h = g = "only" === e && !h && "nextSibling"
                                }
                                return !0
                            }
                            if (h = [a ? m.firstChild : m.lastChild], a && v) {
                                c = m[b] || (m[b] = {}), u = c[e] || [], d = u[0] === T && u[1], f = u[0] === T && u[2], p = d && m.childNodes[d];
                                while (p = ++d && p && p[g] || (f = d = 0) || h.pop())
                                    if (1 === p.nodeType && ++f && p === t) {
                                        c[e] = [T, d, f];
                                        break
                                    }
                            } else if (v && (u = (t[b] || (t[b] = {}))[e]) && u[0] === T) f = u[1];
                            else
                                while (p = ++d && p && p[g] || (f = d = 0) || h.pop())
                                    if ((s ? p.nodeName.toLowerCase() === y : 1 === p.nodeType) && ++f && (v && ((p[b] || (p[b] = {}))[e] = [T, f]), p === t)) break; return f -= i, f === r || 0 === f % r && f / r >= 0
                        }
                    }
                },
                PSEUDO: function(e, t) {
                    var n, r = o.pseudos[e] || o.setFilters[e.toLowerCase()] || at.error("unsupported pseudo: " + e);
                    return r[b] ? r(t) : r.length > 1 ? (n = [e, e, "", t], o.setFilters.hasOwnProperty(e.toLowerCase()) ? ut(function(e, n) {
                        var i, o = r(e, t),
                            a = o.length;
                        while (a--) i = F.call(e, o[a]), e[i] = !(n[i] = o[a])
                    }) : function(e) {
                        return r(e, 0, n)
                    }) : r
                }
            },
            pseudos: {
                not: ut(function(e) {
                    var t = [],
                        n = [],
                        r = l(e.replace(z, "$1"));
                    return r[b] ? ut(function(e, t, n, i) {
                        var o, a = r(e, null, i, []),
                            s = e.length;
                        while (s--)(o = a[s]) && (e[s] = !(t[s] = o))
                    }) : function(e, i, o) {
                        return t[0] = e, r(t, null, o, n), !n.pop()
                    }
                }),
                has: ut(function(e) {
                    return function(t) {
                        return at(e, t).length > 0
                    }
                }),
                contains: ut(function(e) {
                    return function(t) {
                        return (t.textContent || t.innerText || a(t)).indexOf(e) > -1
                    }
                }),
                lang: ut(function(e) {
                    return G.test(e || "") || at.error("unsupported lang: " + e), e = e.replace(rt, it).toLowerCase(),
                        function(t) {
                            var n;
                            do
                                if (n = h ? t.lang : t.getAttribute("xml:lang") || t.getAttribute("lang")) return n = n.toLowerCase(), n === e || 0 === n.indexOf(e + "-");
                            while ((t = t.parentNode) && 1 === t.nodeType);
                            return !1
                        }
                }),
                target: function(t) {
                    var n = e.location && e.location.hash;
                    return n && n.slice(1) === t.id
                },
                root: function(e) {
                    return e === d
                },
                focus: function(e) {
                    return e === f.activeElement && (!f.hasFocus || f.hasFocus()) && !!(e.type || e.href || ~e.tabIndex)
                },
                enabled: function(e) {
                    return e.disabled === !1
                },
                disabled: function(e) {
                    return e.disabled === !0
                },
                checked: function(e) {
                    var t = e.nodeName.toLowerCase();
                    return "input" === t && !!e.checked || "option" === t && !!e.selected
                },
                selected: function(e) {
                    return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
                },
                empty: function(e) {
                    for (e = e.firstChild; e; e = e.nextSibling)
                        if (e.nodeName > "@" || 3 === e.nodeType || 4 === e.nodeType) return !1;
                    return !0
                },
                parent: function(e) {
                    return !o.pseudos.empty(e)
                },
                header: function(e) {
                    return tt.test(e.nodeName)
                },
                input: function(e) {
                    return et.test(e.nodeName)
                },
                button: function(e) {
                    var t = e.nodeName.toLowerCase();
                    return "input" === t && "button" === e.type || "button" === t
                },
                text: function(e) {
                    var t;
                    return "input" === e.nodeName.toLowerCase() && "text" === e.type && (null == (t = e.getAttribute("type")) || t.toLowerCase() === e.type)
                },
                first: vt(function() {
                    return [0]
                }),
                last: vt(function(e, t) {
                    return [t - 1]
                }),
                eq: vt(function(e, t, n) {
                    return [0 > n ? n + t : n]
                }),
                even: vt(function(e, t) {
                    var n = 0;
                    for (; t > n; n += 2) e.push(n);
                    return e
                }),
                odd: vt(function(e, t) {
                    var n = 1;
                    for (; t > n; n += 2) e.push(n);
                    return e
                }),
                lt: vt(function(e, t, n) {
                    var r = 0 > n ? n + t : n;
                    for (; --r >= 0;) e.push(r);
                    return e
                }),
                gt: vt(function(e, t, n) {
                    var r = 0 > n ? n + t : n;
                    for (; t > ++r;) e.push(r);
                    return e
                })
            }
        };
        for (n in {
            radio: !0,
            checkbox: !0,
            file: !0,
            password: !0,
            image: !0
        }) o.pseudos[n] = mt(n);
        for (n in {
            submit: !0,
            reset: !0
        }) o.pseudos[n] = yt(n);

        function bt(e, t) {
            var n, r, i, a, s, l, u, c = k[e + " "];
            if (c) return t ? 0 : c.slice(0);
            s = e, l = [], u = o.preFilter;
            while (s) {
                (!n || (r = X.exec(s))) && (r && (s = s.slice(r[0].length) || s), l.push(i = [])), n = !1, (r = U.exec(s)) && (n = r.shift(), i.push({
                    value: n,
                    type: r[0].replace(z, " ")
                }), s = s.slice(n.length));
                for (a in o.filter)!(r = Q[a].exec(s)) || u[a] && !(r = u[a](r)) || (n = r.shift(), i.push({
                    value: n,
                    type: a,
                    matches: r
                }), s = s.slice(n.length));
                if (!n) break
            }
            return t ? s.length : s ? at.error(e) : k(e, l).slice(0)
        }

        function xt(e) {
            var t = 0,
                n = e.length,
                r = "";
            for (; n > t; t++) r += e[t].value;
            return r
        }

        function wt(e, t, n) {
            var r = t.dir,
                o = n && "parentNode" === r,
                a = C++;
            return t.first ? function(t, n, i) {
                while (t = t[r])
                    if (1 === t.nodeType || o) return e(t, n, i)
            } : function(t, n, s) {
                var l, u, c, p = T + " " + a;
                if (s) {
                    while (t = t[r])
                        if ((1 === t.nodeType || o) && e(t, n, s)) return !0
                } else
                    while (t = t[r])
                        if (1 === t.nodeType || o)
                            if (c = t[b] || (t[b] = {}), (u = c[r]) && u[0] === p) {
                                if ((l = u[1]) === !0 || l === i) return l === !0
                            } else if (u = c[r] = [p], u[1] = e(t, n, s) || i, u[1] === !0) return !0
            }
        }

        function Tt(e) {
            return e.length > 1 ? function(t, n, r) {
                var i = e.length;
                while (i--)
                    if (!e[i](t, n, r)) return !1;
                return !0
            } : e[0]
        }

        function Ct(e, t, n, r, i) {
            var o, a = [],
                s = 0,
                l = e.length,
                u = null != t;
            for (; l > s; s++)(o = e[s]) && (!n || n(o, r, i)) && (a.push(o), u && t.push(s));
            return a
        }

        function Nt(e, t, n, r, i, o) {
            return r && !r[b] && (r = Nt(r)), i && !i[b] && (i = Nt(i, o)), ut(function(o, a, s, l) {
                var u, c, p, f = [],
                    d = [],
                    h = a.length,
                    g = o || St(t || "*", s.nodeType ? [s] : s, []),
                    m = !e || !o && t ? g : Ct(g, f, e, s, l),
                    y = n ? i || (o ? e : h || r) ? [] : a : m;
                if (n && n(m, y, s, l), r) {
                    u = Ct(y, d), r(u, [], s, l), c = u.length;
                    while (c--)(p = u[c]) && (y[d[c]] = !(m[d[c]] = p))
                }
                if (o) {
                    if (i || e) {
                        if (i) {
                            u = [], c = y.length;
                            while (c--)(p = y[c]) && u.push(m[c] = p);
                            i(null, y = [], u, l)
                        }
                        c = y.length;
                        while (c--)(p = y[c]) && (u = i ? F.call(o, p) : f[c]) > -1 && (o[u] = !(a[u] = p))
                    }
                } else y = Ct(y === a ? y.splice(h, y.length) : y), i ? i(null, a, y, l) : M.apply(a, y)
            })
        }

        function kt(e) {
            var t, n, r, i = e.length,
                a = o.relative[e[0].type],
                s = a || o.relative[" "],
                l = a ? 1 : 0,
                c = wt(function(e) {
                    return e === t
                }, s, !0),
                p = wt(function(e) {
                    return F.call(t, e) > -1
                }, s, !0),
                f = [
                    function(e, n, r) {
                        return !a && (r || n !== u) || ((t = n).nodeType ? c(e, n, r) : p(e, n, r))
                    }
                ];
            for (; i > l; l++)
                if (n = o.relative[e[l].type]) f = [wt(Tt(f), n)];
                else {
                    if (n = o.filter[e[l].type].apply(null, e[l].matches), n[b]) {
                        for (r = ++l; i > r; r++)
                            if (o.relative[e[r].type]) break;
                        return Nt(l > 1 && Tt(f), l > 1 && xt(e.slice(0, l - 1).concat({
                            value: " " === e[l - 2].type ? "*" : ""
                        })).replace(z, "$1"), n, r > l && kt(e.slice(l, r)), i > r && kt(e = e.slice(r)), i > r && xt(e))
                    }
                    f.push(n)
                }
            return Tt(f)
        }

        function Et(e, t) {
            var n = 0,
                r = t.length > 0,
                a = e.length > 0,
                s = function(s, l, c, p, d) {
                    var h, g, m, y = [],
                        v = 0,
                        b = "0",
                        x = s && [],
                        w = null != d,
                        C = u,
                        N = s || a && o.find.TAG("*", d && l.parentNode || l),
                        k = T += null == C ? 1 : Math.random() || .1;
                    for (w && (u = l !== f && l, i = n); null != (h = N[b]); b++) {
                        if (a && h) {
                            g = 0;
                            while (m = e[g++])
                                if (m(h, l, c)) {
                                    p.push(h);
                                    break
                                }
                            w && (T = k, i = ++n)
                        }
                        r && ((h = !m && h) && v--, s && x.push(h))
                    }
                    if (v += b, r && b !== v) {
                        g = 0;
                        while (m = t[g++]) m(x, y, l, c);
                        if (s) {
                            if (v > 0)
                                while (b--) x[b] || y[b] || (y[b] = q.call(p));
                            y = Ct(y)
                        }
                        M.apply(p, y), w && !s && y.length > 0 && v + t.length > 1 && at.uniqueSort(p)
                    }
                    return w && (T = k, u = C), x
                };
            return r ? ut(s) : s
        }
        l = at.compile = function(e, t) {
            var n, r = [],
                i = [],
                o = E[e + " "];
            if (!o) {
                t || (t = bt(e)), n = t.length;
                while (n--) o = kt(t[n]), o[b] ? r.push(o) : i.push(o);
                o = E(e, Et(i, r))
            }
            return o
        };

        function St(e, t, n) {
            var r = 0,
                i = t.length;
            for (; i > r; r++) at(e, t[r], n);
            return n
        }

        function At(e, t, n, i) {
            var a, s, u, c, p, f = bt(e);
            if (!i && 1 === f.length) {
                if (s = f[0] = f[0].slice(0), s.length > 2 && "ID" === (u = s[0]).type && r.getById && 9 === t.nodeType && h && o.relative[s[1].type]) {
                    if (t = (o.find.ID(u.matches[0].replace(rt, it), t) || [])[0], !t) return n;
                    e = e.slice(s.shift().value.length)
                }
                a = Q.needsContext.test(e) ? 0 : s.length;
                while (a--) {
                    if (u = s[a], o.relative[c = u.type]) break;
                    if ((p = o.find[c]) && (i = p(u.matches[0].replace(rt, it), V.test(s[0].type) && t.parentNode || t))) {
                        if (s.splice(a, 1), e = i.length && xt(s), !e) return M.apply(n, i), n;
                        break
                    }
                }
            }
            return l(e, f)(i, t, !h, n, V.test(e)), n
        }
        o.pseudos.nth = o.pseudos.eq;

        function jt() {}
        jt.prototype = o.filters = o.pseudos, o.setFilters = new jt, r.sortStable = b.split("").sort(A).join("") === b, p(), [0, 0].sort(A), r.detectDuplicates = S, x.find = at, x.expr = at.selectors, x.expr[":"] = x.expr.pseudos, x.unique = at.uniqueSort, x.text = at.getText, x.isXMLDoc = at.isXML, x.contains = at.contains
    }(e);
    var O = {};

    function F(e) {
        var t = O[e] = {};
        return x.each(e.match(T) || [], function(e, n) {
            t[n] = !0
        }), t
    }
    x.Callbacks = function(e) {
        e = "string" == typeof e ? O[e] || F(e) : x.extend({}, e);
        var n, r, i, o, a, s, l = [],
            u = !e.once && [],
            c = function(t) {
                for (r = e.memory && t, i = !0, a = s || 0, s = 0, o = l.length, n = !0; l && o > a; a++)
                    if (l[a].apply(t[0], t[1]) === !1 && e.stopOnFalse) {
                        r = !1;
                        break
                    }
                n = !1, l && (u ? u.length && c(u.shift()) : r ? l = [] : p.disable())
            },
            p = {
                add: function() {
                    if (l) {
                        var t = l.length;
                        (function i(t) {
                            x.each(t, function(t, n) {
                                var r = x.type(n);
                                "function" === r ? e.unique && p.has(n) || l.push(n) : n && n.length && "string" !== r && i(n)
                            })
                        })(arguments), n ? o = l.length : r && (s = t, c(r))
                    }
                    return this
                },
                remove: function() {
                    return l && x.each(arguments, function(e, t) {
                        var r;
                        while ((r = x.inArray(t, l, r)) > -1) l.splice(r, 1), n && (o >= r && o--, a >= r && a--)
                    }), this
                },
                has: function(e) {
                    return e ? x.inArray(e, l) > -1 : !(!l || !l.length)
                },
                empty: function() {
                    return l = [], o = 0, this
                },
                disable: function() {
                    return l = u = r = t, this
                },
                disabled: function() {
                    return !l
                },
                lock: function() {
                    return u = t, r || p.disable(), this
                },
                locked: function() {
                    return !u
                },
                fireWith: function(e, t) {
                    return t = t || [], t = [e, t.slice ? t.slice() : t], !l || i && !u || (n ? u.push(t) : c(t)), this
                },
                fire: function() {
                    return p.fireWith(this, arguments), this
                },
                fired: function() {
                    return !!i
                }
            };
        return p
    }, x.extend({
        Deferred: function(e) {
            var t = [
                    ["resolve", "done", x.Callbacks("once memory"), "resolved"],
                    ["reject", "fail", x.Callbacks("once memory"), "rejected"],
                    ["notify", "progress", x.Callbacks("memory")]
                ],
                n = "pending",
                r = {
                    state: function() {
                        return n
                    },
                    always: function() {
                        return i.done(arguments).fail(arguments), this
                    },
                    then: function() {
                        var e = arguments;
                        return x.Deferred(function(n) {
                            x.each(t, function(t, o) {
                                var a = o[0],
                                    s = x.isFunction(e[t]) && e[t];
                                i[o[1]](function() {
                                    var e = s && s.apply(this, arguments);
                                    e && x.isFunction(e.promise) ? e.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[a + "With"](this === r ? n.promise() : this, s ? [e] : arguments)
                                })
                            }), e = null
                        }).promise()
                    },
                    promise: function(e) {
                        return null != e ? x.extend(e, r) : r
                    }
                },
                i = {};
            return r.pipe = r.then, x.each(t, function(e, o) {
                var a = o[2],
                    s = o[3];
                r[o[1]] = a.add, s && a.add(function() {
                    n = s
                }, t[1 ^ e][2].disable, t[2][2].lock), i[o[0]] = function() {
                    return i[o[0] + "With"](this === i ? r : this, arguments), this
                }, i[o[0] + "With"] = a.fireWith
            }), r.promise(i), e && e.call(i, i), i
        },
        when: function(e) {
            var t = 0,
                n = g.call(arguments),
                r = n.length,
                i = 1 !== r || e && x.isFunction(e.promise) ? r : 0,
                o = 1 === i ? e : x.Deferred(),
                a = function(e, t, n) {
                    return function(r) {
                        t[e] = this, n[e] = arguments.length > 1 ? g.call(arguments) : r, n === s ? o.notifyWith(t, n) : --i || o.resolveWith(t, n)
                    }
                },
                s, l, u;
            if (r > 1)
                for (s = Array(r), l = Array(r), u = Array(r); r > t; t++) n[t] && x.isFunction(n[t].promise) ? n[t].promise().done(a(t, u, n)).fail(o.reject).progress(a(t, l, s)) : --i;
            return i || o.resolveWith(u, n), o.promise()
        }
    }), x.support = function(t) {
        var n, r, o, s, l, u, c, p, f, d = a.createElement("div");
        if (d.setAttribute("className", "t"), d.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", n = d.getElementsByTagName("*") || [], r = d.getElementsByTagName("a")[0], !r || !r.style || !n.length) return t;
        s = a.createElement("select"), u = s.appendChild(a.createElement("option")), o = d.getElementsByTagName("input")[0], r.style.cssText = "top:1px;float:left;opacity:.5", t.getSetAttribute = "t" !== d.className, t.leadingWhitespace = 3 === d.firstChild.nodeType, t.tbody = !d.getElementsByTagName("tbody").length, t.htmlSerialize = !!d.getElementsByTagName("link").length, t.style = /top/.test(r.getAttribute("style")), t.hrefNormalized = "/a" === r.getAttribute("href"), t.opacity = /^0.5/.test(r.style.opacity), t.cssFloat = !!r.style.cssFloat, t.checkOn = !!o.value, t.optSelected = u.selected, t.enctype = !!a.createElement("form").enctype, t.html5Clone = "<:nav></:nav>" !== a.createElement("nav").cloneNode(!0).outerHTML, t.inlineBlockNeedsLayout = !1, t.shrinkWrapBlocks = !1, t.pixelPosition = !1, t.deleteExpando = !0, t.noCloneEvent = !0, t.reliableMarginRight = !0, t.boxSizingReliable = !0, o.checked = !0, t.noCloneChecked = o.cloneNode(!0).checked, s.disabled = !0, t.optDisabled = !u.disabled;
        try {
            delete d.test
        } catch (h) {
            t.deleteExpando = !1
        }
        o = a.createElement("input"), o.setAttribute("value", ""), t.input = "" === o.getAttribute("value"), o.value = "t", o.setAttribute("type", "radio"), t.radioValue = "t" === o.value, o.setAttribute("checked", "t"), o.setAttribute("name", "t"), l = a.createDocumentFragment(), l.appendChild(o), t.appendChecked = o.checked, t.checkClone = l.cloneNode(!0).cloneNode(!0).lastChild.checked, d.attachEvent && (d.attachEvent("onclick", function() {
            t.noCloneEvent = !1
        }), d.cloneNode(!0).click());
        for (f in {
            submit: !0,
            change: !0,
            focusin: !0
        }) d.setAttribute(c = "on" + f, "t"), t[f + "Bubbles"] = c in e || d.attributes[c].expando === !1;
        d.style.backgroundClip = "content-box", d.cloneNode(!0).style.backgroundClip = "", t.clearCloneStyle = "content-box" === d.style.backgroundClip;
        for (f in x(t)) break;
        return t.ownLast = "0" !== f, x(function() {
            var n, r, o, s = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
                l = a.getElementsByTagName("body")[0];
            l && (n = a.createElement("div"), n.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", l.appendChild(n).appendChild(d), d.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", o = d.getElementsByTagName("td"), o[0].style.cssText = "padding:0;margin:0;border:0;display:none", p = 0 === o[0].offsetHeight, o[0].style.display = "", o[1].style.display = "none", t.reliableHiddenOffsets = p && 0 === o[0].offsetHeight, d.innerHTML = "", d.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;", x.swap(l, null != l.style.zoom ? {
                zoom: 1
            } : {}, function() {
                t.boxSizing = 4 === d.offsetWidth
            }), e.getComputedStyle && (t.pixelPosition = "1%" !== (e.getComputedStyle(d, null) || {}).top, t.boxSizingReliable = "4px" === (e.getComputedStyle(d, null) || {
                width: "4px"
            }).width, r = d.appendChild(a.createElement("div")), r.style.cssText = d.style.cssText = s, r.style.marginRight = r.style.width = "0", d.style.width = "1px", t.reliableMarginRight = !parseFloat((e.getComputedStyle(r, null) || {}).marginRight)), typeof d.style.zoom !== i && (d.innerHTML = "", d.style.cssText = s + "width:1px;padding:1px;display:inline;zoom:1", t.inlineBlockNeedsLayout = 3 === d.offsetWidth, d.style.display = "block", d.innerHTML = "<div></div>", d.firstChild.style.width = "5px", t.shrinkWrapBlocks = 3 !== d.offsetWidth, t.inlineBlockNeedsLayout && (l.style.zoom = 1)), l.removeChild(n), n = d = o = r = null)
        }), n = s = l = u = r = o = null, t
    }({});
    var B = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
        P = /([A-Z])/g;

    function R(e, n, r, i) {
        if (x.acceptData(e)) {
            var o, a, s = x.expando,
                l = e.nodeType,
                u = l ? x.cache : e,
                c = l ? e[s] : e[s] && s;
            if (c && u[c] && (i || u[c].data) || r !== t || "string" != typeof n) return c || (c = l ? e[s] = p.pop() || x.guid++ : s), u[c] || (u[c] = l ? {} : {
                toJSON: x.noop
            }), ("object" == typeof n || "function" == typeof n) && (i ? u[c] = x.extend(u[c], n) : u[c].data = x.extend(u[c].data, n)), a = u[c], i || (a.data || (a.data = {}), a = a.data), r !== t && (a[x.camelCase(n)] = r), "string" == typeof n ? (o = a[n], null == o && (o = a[x.camelCase(n)])) : o = a, o
        }
    }

    function W(e, t, n) {
        if (x.acceptData(e)) {
            var r, i, o = e.nodeType,
                a = o ? x.cache : e,
                s = o ? e[x.expando] : x.expando;
            if (a[s]) {
                if (t && (r = n ? a[s] : a[s].data)) {
                    x.isArray(t) ? t = t.concat(x.map(t, x.camelCase)) : t in r ? t = [t] : (t = x.camelCase(t), t = t in r ? [t] : t.split(" ")), i = t.length;
                    while (i--) delete r[t[i]];
                    if (n ? !I(r) : !x.isEmptyObject(r)) return
                }(n || (delete a[s].data, I(a[s]))) && (o ? x.cleanData([e], !0) : x.support.deleteExpando || a != a.window ? delete a[s] : a[s] = null)
            }
        }
    }
    x.extend({
        cache: {},
        noData: {
            applet: !0,
            embed: !0,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        },
        hasData: function(e) {
            return e = e.nodeType ? x.cache[e[x.expando]] : e[x.expando], !!e && !I(e)
        },
        data: function(e, t, n) {
            return R(e, t, n)
        },
        removeData: function(e, t) {
            return W(e, t)
        },
        _data: function(e, t, n) {
            return R(e, t, n, !0)
        },
        _removeData: function(e, t) {
            return W(e, t, !0)
        },
        acceptData: function(e) {
            if (e.nodeType && 1 !== e.nodeType && 9 !== e.nodeType) return !1;
            var t = e.nodeName && x.noData[e.nodeName.toLowerCase()];
            return !t || t !== !0 && e.getAttribute("classid") === t
        }
    }), x.fn.extend({
        data: function(e, n) {
            var r, i, o = null,
                a = 0,
                s = this[0];
            if (e === t) {
                if (this.length && (o = x.data(s), 1 === s.nodeType && !x._data(s, "parsedAttrs"))) {
                    for (r = s.attributes; r.length > a; a++) i = r[a].name, 0 === i.indexOf("data-") && (i = x.camelCase(i.slice(5)), $(s, i, o[i]));
                    x._data(s, "parsedAttrs", !0)
                }
                return o
            }
            return "object" == typeof e ? this.each(function() {
                x.data(this, e)
            }) : arguments.length > 1 ? this.each(function() {
                x.data(this, e, n)
            }) : s ? $(s, e, x.data(s, e)) : null
        },
        removeData: function(e) {
            return this.each(function() {
                x.removeData(this, e)
            })
        }
    });

    function $(e, n, r) {
        if (r === t && 1 === e.nodeType) {
            var i = "data-" + n.replace(P, "-$1").toLowerCase();
            if (r = e.getAttribute(i), "string" == typeof r) {
                try {
                    r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : +r + "" === r ? +r : B.test(r) ? x.parseJSON(r) : r
                } catch (o) {}
                x.data(e, n, r)
            } else r = t
        }
        return r
    }

    function I(e) {
        var t;
        for (t in e)
            if (("data" !== t || !x.isEmptyObject(e[t])) && "toJSON" !== t) return !1;
        return !0
    }
    x.extend({
        queue: function(e, n, r) {
            var i;
            return e ? (n = (n || "fx") + "queue", i = x._data(e, n), r && (!i || x.isArray(r) ? i = x._data(e, n, x.makeArray(r)) : i.push(r)), i || []) : t
        },
        dequeue: function(e, t) {
            t = t || "fx";
            var n = x.queue(e, t),
                r = n.length,
                i = n.shift(),
                o = x._queueHooks(e, t),
                a = function() {
                    x.dequeue(e, t)
                };
            "inprogress" === i && (i = n.shift(), r--), i && ("fx" === t && n.unshift("inprogress"), delete o.stop, i.call(e, a, o)), !r && o && o.empty.fire()
        },
        _queueHooks: function(e, t) {
            var n = t + "queueHooks";
            return x._data(e, n) || x._data(e, n, {
                empty: x.Callbacks("once memory").add(function() {
                    x._removeData(e, t + "queue"), x._removeData(e, n)
                })
            })
        }
    }), x.fn.extend({
        queue: function(e, n) {
            var r = 2;
            return "string" != typeof e && (n = e, e = "fx", r--), r > arguments.length ? x.queue(this[0], e) : n === t ? this : this.each(function() {
                var t = x.queue(this, e, n);
                x._queueHooks(this, e), "fx" === e && "inprogress" !== t[0] && x.dequeue(this, e)
            })
        },
        dequeue: function(e) {
            return this.each(function() {
                x.dequeue(this, e)
            })
        },
        delay: function(e, t) {
            return e = x.fx ? x.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function(t, n) {
                var r = setTimeout(t, e);
                n.stop = function() {
                    clearTimeout(r)
                }
            })
        },
        clearQueue: function(e) {
            return this.queue(e || "fx", [])
        },
        promise: function(e, n) {
            var r, i = 1,
                o = x.Deferred(),
                a = this,
                s = this.length,
                l = function() {
                    --i || o.resolveWith(a, [a])
                };
            "string" != typeof e && (n = e, e = t), e = e || "fx";
            while (s--) r = x._data(a[s], e + "queueHooks"), r && r.empty && (i++, r.empty.add(l));
            return l(), o.promise(n)
        }
    });
    var z, X, U = /[\t\r\n\f]/g,
        V = /\r/g,
        Y = /^(?:input|select|textarea|button|object)$/i,
        J = /^(?:a|area)$/i,
        G = /^(?:checked|selected)$/i,
        Q = x.support.getSetAttribute,
        K = x.support.input;
    x.fn.extend({
        attr: function(e, t) {
            return x.access(this, x.attr, e, t, arguments.length > 1)
        },
        removeAttr: function(e) {
            return this.each(function() {
                x.removeAttr(this, e)
            })
        },
        prop: function(e, t) {
            return x.access(this, x.prop, e, t, arguments.length > 1)
        },
        removeProp: function(e) {
            return e = x.propFix[e] || e, this.each(function() {
                try {
                    this[e] = t, delete this[e]
                } catch (n) {}
            })
        },
        addClass: function(e) {
            var t, n, r, i, o, a = 0,
                s = this.length,
                l = "string" == typeof e && e;
            if (x.isFunction(e)) return this.each(function(t) {
                x(this).addClass(e.call(this, t, this.className))
            });
            if (l)
                for (t = (e || "").match(T) || []; s > a; a++)
                    if (n = this[a], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(U, " ") : " ")) {
                        o = 0;
                        while (i = t[o++]) 0 > r.indexOf(" " + i + " ") && (r += i + " ");
                        n.className = x.trim(r)
                    }
            return this
        },
        removeClass: function(e) {
            var t, n, r, i, o, a = 0,
                s = this.length,
                l = 0 === arguments.length || "string" == typeof e && e;
            if (x.isFunction(e)) return this.each(function(t) {
                x(this).removeClass(e.call(this, t, this.className))
            });
            if (l)
                for (t = (e || "").match(T) || []; s > a; a++)
                    if (n = this[a], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(U, " ") : "")) {
                        o = 0;
                        while (i = t[o++])
                            while (r.indexOf(" " + i + " ") >= 0) r = r.replace(" " + i + " ", " ");
                        n.className = e ? x.trim(r) : ""
                    }
            return this
        },
        toggleClass: function(e, t) {
            var n = typeof e,
                r = "boolean" == typeof t;
            return x.isFunction(e) ? this.each(function(n) {
                x(this).toggleClass(e.call(this, n, this.className, t), t)
            }) : this.each(function() {
                if ("string" === n) {
                    var o, a = 0,
                        s = x(this),
                        l = t,
                        u = e.match(T) || [];
                    while (o = u[a++]) l = r ? l : !s.hasClass(o), s[l ? "addClass" : "removeClass"](o)
                } else(n === i || "boolean" === n) && (this.className && x._data(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : x._data(this, "__className__") || "")
            })
        },
        hasClass: function(e) {
            var t = " " + e + " ",
                n = 0,
                r = this.length;
            for (; r > n; n++)
                if (1 === this[n].nodeType && (" " + this[n].className + " ").replace(U, " ").indexOf(t) >= 0) return !0;
            return !1
        },
        val: function(e) {
            var n, r, i, o = this[0]; {
                if (arguments.length) return i = x.isFunction(e), this.each(function(n) {
                    var o;
                    1 === this.nodeType && (o = i ? e.call(this, n, x(this).val()) : e, null == o ? o = "" : "number" == typeof o ? o += "" : x.isArray(o) && (o = x.map(o, function(e) {
                        return null == e ? "" : e + ""
                    })), r = x.valHooks[this.type] || x.valHooks[this.nodeName.toLowerCase()], r && "set" in r && r.set(this, o, "value") !== t || (this.value = o))
                });
                if (o) return r = x.valHooks[o.type] || x.valHooks[o.nodeName.toLowerCase()], r && "get" in r && (n = r.get(o, "value")) !== t ? n : (n = o.value, "string" == typeof n ? n.replace(V, "") : null == n ? "" : n)
            }
        }
    }), x.extend({
        valHooks: {
            option: {
                get: function(e) {
                    var t = x.find.attr(e, "value");
                    return null != t ? t : e.text
                }
            },
            select: {
                get: function(e) {
                    var t, n, r = e.options,
                        i = e.selectedIndex,
                        o = "select-one" === e.type || 0 > i,
                        a = o ? null : [],
                        s = o ? i + 1 : r.length,
                        l = 0 > i ? s : o ? i : 0;
                    for (; s > l; l++)
                        if (n = r[l], !(!n.selected && l !== i || (x.support.optDisabled ? n.disabled : null !== n.getAttribute("disabled")) || n.parentNode.disabled && x.nodeName(n.parentNode, "optgroup"))) {
                            if (t = x(n).val(), o) return t;
                            a.push(t)
                        }
                    return a
                },
                set: function(e, t) {
                    var n, r, i = e.options,
                        o = x.makeArray(t),
                        a = i.length;
                    while (a--) r = i[a], (r.selected = x.inArray(x(r).val(), o) >= 0) && (n = !0);
                    return n || (e.selectedIndex = -1), o
                }
            }
        },
        attr: function(e, n, r) {
            var o, a, s = e.nodeType;
            if (e && 3 !== s && 8 !== s && 2 !== s) return typeof e.getAttribute === i ? x.prop(e, n, r) : (1 === s && x.isXMLDoc(e) || (n = n.toLowerCase(), o = x.attrHooks[n] || (x.expr.match.bool.test(n) ? X : z)), r === t ? o && "get" in o && null !== (a = o.get(e, n)) ? a : (a = x.find.attr(e, n), null == a ? t : a) : null !== r ? o && "set" in o && (a = o.set(e, r, n)) !== t ? a : (e.setAttribute(n, r + ""), r) : (x.removeAttr(e, n), t))
        },
        removeAttr: function(e, t) {
            var n, r, i = 0,
                o = t && t.match(T);
            if (o && 1 === e.nodeType)
                while (n = o[i++]) r = x.propFix[n] || n, x.expr.match.bool.test(n) ? K && Q || !G.test(n) ? e[r] = !1 : e[x.camelCase("default-" + n)] = e[r] = !1 : x.attr(e, n, ""), e.removeAttribute(Q ? n : r)
        },
        attrHooks: {
            type: {
                set: function(e, t) {
                    if (!x.support.radioValue && "radio" === t && x.nodeName(e, "input")) {
                        var n = e.value;
                        return e.setAttribute("type", t), n && (e.value = n), t
                    }
                }
            }
        },
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },
        prop: function(e, n, r) {
            var i, o, a, s = e.nodeType;
            if (e && 3 !== s && 8 !== s && 2 !== s) return a = 1 !== s || !x.isXMLDoc(e), a && (n = x.propFix[n] || n, o = x.propHooks[n]), r !== t ? o && "set" in o && (i = o.set(e, r, n)) !== t ? i : e[n] = r : o && "get" in o && null !== (i = o.get(e, n)) ? i : e[n]
        },
        propHooks: {
            tabIndex: {
                get: function(e) {
                    var t = x.find.attr(e, "tabindex");
                    return t ? parseInt(t, 10) : Y.test(e.nodeName) || J.test(e.nodeName) && e.href ? 0 : -1
                }
            }
        }
    }), X = {
        set: function(e, t, n) {
            return t === !1 ? x.removeAttr(e, n) : K && Q || !G.test(n) ? e.setAttribute(!Q && x.propFix[n] || n, n) : e[x.camelCase("default-" + n)] = e[n] = !0, n
        }
    }, x.each(x.expr.match.bool.source.match(/\w+/g), function(e, n) {
        var r = x.expr.attrHandle[n] || x.find.attr;
        x.expr.attrHandle[n] = K && Q || !G.test(n) ? function(e, n, i) {
            var o = x.expr.attrHandle[n],
                a = i ? t : (x.expr.attrHandle[n] = t) != r(e, n, i) ? n.toLowerCase() : null;
            return x.expr.attrHandle[n] = o, a
        } : function(e, n, r) {
            return r ? t : e[x.camelCase("default-" + n)] ? n.toLowerCase() : null
        }
    }), K && Q || (x.attrHooks.value = {
        set: function(e, n, r) {
            return x.nodeName(e, "input") ? (e.defaultValue = n, t) : z && z.set(e, n, r)
        }
    }), Q || (z = {
        set: function(e, n, r) {
            var i = e.getAttributeNode(r);
            return i || e.setAttributeNode(i = e.ownerDocument.createAttribute(r)), i.value = n += "", "value" === r || n === e.getAttribute(r) ? n : t
        }
    }, x.expr.attrHandle.id = x.expr.attrHandle.name = x.expr.attrHandle.coords = function(e, n, r) {
        var i;
        return r ? t : (i = e.getAttributeNode(n)) && "" !== i.value ? i.value : null
    }, x.valHooks.button = {
        get: function(e, n) {
            var r = e.getAttributeNode(n);
            return r && r.specified ? r.value : t
        },
        set: z.set
    }, x.attrHooks.contenteditable = {
        set: function(e, t, n) {
            z.set(e, "" === t ? !1 : t, n)
        }
    }, x.each(["width", "height"], function(e, n) {
        x.attrHooks[n] = {
            set: function(e, r) {
                return "" === r ? (e.setAttribute(n, "auto"), r) : t
            }
        }
    })), x.support.hrefNormalized || x.each(["href", "src"], function(e, t) {
        x.propHooks[t] = {
            get: function(e) {
                return e.getAttribute(t, 4)
            }
        }
    }), x.support.style || (x.attrHooks.style = {
        get: function(e) {
            return e.style.cssText || t
        },
        set: function(e, t) {
            return e.style.cssText = t + ""
        }
    }), x.support.optSelected || (x.propHooks.selected = {
        get: function(e) {
            var t = e.parentNode;
            return t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex), null
        }
    }), x.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
        x.propFix[this.toLowerCase()] = this
    }), x.support.enctype || (x.propFix.enctype = "encoding"), x.each(["radio", "checkbox"], function() {
        x.valHooks[this] = {
            set: function(e, n) {
                return x.isArray(n) ? e.checked = x.inArray(x(e).val(), n) >= 0 : t
            }
        }, x.support.checkOn || (x.valHooks[this].get = function(e) {
            return null === e.getAttribute("value") ? "on" : e.value
        })
    });
    var Z = /^(?:input|select|textarea)$/i,
        et = /^key/,
        tt = /^(?:mouse|contextmenu)|click/,
        nt = /^(?:focusinfocus|focusoutblur)$/,
        rt = /^([^.]*)(?:\.(.+)|)$/;

    function it() {
        return !0
    }

    function ot() {
        return !1
    }

    function at() {
        try {
            return a.activeElement
        } catch (e) {}
    }
    x.event = {
        global: {},
        add: function(e, n, r, o, a) {
            var s, l, u, c, p, f, d, h, g, m, y, v = x._data(e);
            if (v) {
                r.handler && (c = r, r = c.handler, a = c.selector), r.guid || (r.guid = x.guid++), (l = v.events) || (l = v.events = {}), (f = v.handle) || (f = v.handle = function(e) {
                    return typeof x === i || e && x.event.triggered === e.type ? t : x.event.dispatch.apply(f.elem, arguments)
                }, f.elem = e), n = (n || "").match(T) || [""], u = n.length;
                while (u--) s = rt.exec(n[u]) || [], g = y = s[1], m = (s[2] || "").split(".").sort(), g && (p = x.event.special[g] || {}, g = (a ? p.delegateType : p.bindType) || g, p = x.event.special[g] || {}, d = x.extend({
                    type: g,
                    origType: y,
                    data: o,
                    handler: r,
                    guid: r.guid,
                    selector: a,
                    needsContext: a && x.expr.match.needsContext.test(a),
                    namespace: m.join(".")
                }, c), (h = l[g]) || (h = l[g] = [], h.delegateCount = 0, p.setup && p.setup.call(e, o, m, f) !== !1 || (e.addEventListener ? e.addEventListener(g, f, !1) : e.attachEvent && e.attachEvent("on" + g, f))), p.add && (p.add.call(e, d), d.handler.guid || (d.handler.guid = r.guid)), a ? h.splice(h.delegateCount++, 0, d) : h.push(d), x.event.global[g] = !0);
                e = null
            }
        },
        remove: function(e, t, n, r, i) {
            var o, a, s, l, u, c, p, f, d, h, g, m = x.hasData(e) && x._data(e);
            if (m && (c = m.events)) {
                t = (t || "").match(T) || [""], u = t.length;
                while (u--)
                    if (s = rt.exec(t[u]) || [], d = g = s[1], h = (s[2] || "").split(".").sort(), d) {
                        p = x.event.special[d] || {}, d = (r ? p.delegateType : p.bindType) || d, f = c[d] || [], s = s[2] && RegExp("(^|\\.)" + h.join("\\.(?:.*\\.|)") + "(\\.|$)"), l = o = f.length;
                        while (o--) a = f[o], !i && g !== a.origType || n && n.guid !== a.guid || s && !s.test(a.namespace) || r && r !== a.selector && ("**" !== r || !a.selector) || (f.splice(o, 1), a.selector && f.delegateCount--, p.remove && p.remove.call(e, a));
                        l && !f.length && (p.teardown && p.teardown.call(e, h, m.handle) !== !1 || x.removeEvent(e, d, m.handle), delete c[d])
                    } else
                        for (d in c) x.event.remove(e, d + t[u], n, r, !0);
                x.isEmptyObject(c) && (delete m.handle, x._removeData(e, "events"))
            }
        },
        trigger: function(n, r, i, o) {
            var s, l, u, c, p, f, d, h = [i || a],
                g = v.call(n, "type") ? n.type : n,
                m = v.call(n, "namespace") ? n.namespace.split(".") : [];
            if (u = f = i = i || a, 3 !== i.nodeType && 8 !== i.nodeType && !nt.test(g + x.event.triggered) && (g.indexOf(".") >= 0 && (m = g.split("."), g = m.shift(), m.sort()), l = 0 > g.indexOf(":") && "on" + g, n = n[x.expando] ? n : new x.Event(g, "object" == typeof n && n), n.isTrigger = o ? 2 : 3, n.namespace = m.join("."), n.namespace_re = n.namespace ? RegExp("(^|\\.)" + m.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, n.result = t, n.target || (n.target = i), r = null == r ? [n] : x.makeArray(r, [n]), p = x.event.special[g] || {}, o || !p.trigger || p.trigger.apply(i, r) !== !1)) {
                if (!o && !p.noBubble && !x.isWindow(i)) {
                    for (c = p.delegateType || g, nt.test(c + g) || (u = u.parentNode); u; u = u.parentNode) h.push(u), f = u;
                    f === (i.ownerDocument || a) && h.push(f.defaultView || f.parentWindow || e)
                }
                d = 0;
                while ((u = h[d++]) && !n.isPropagationStopped()) n.type = d > 1 ? c : p.bindType || g, s = (x._data(u, "events") || {})[n.type] && x._data(u, "handle"), s && s.apply(u, r), s = l && u[l], s && x.acceptData(u) && s.apply && s.apply(u, r) === !1 && n.preventDefault();
                if (n.type = g, !o && !n.isDefaultPrevented() && (!p._default || p._default.apply(h.pop(), r) === !1) && x.acceptData(i) && l && i[g] && !x.isWindow(i)) {
                    f = i[l], f && (i[l] = null), x.event.triggered = g;
                    try {
                        i[g]()
                    } catch (y) {}
                    x.event.triggered = t, f && (i[l] = f)
                }
                return n.result
            }
        },
        dispatch: function(e) {
            e = x.event.fix(e);
            var n, r, i, o, a, s = [],
                l = g.call(arguments),
                u = (x._data(this, "events") || {})[e.type] || [],
                c = x.event.special[e.type] || {};
            if (l[0] = e, e.delegateTarget = this, !c.preDispatch || c.preDispatch.call(this, e) !== !1) {
                s = x.event.handlers.call(this, e, u), n = 0;
                while ((o = s[n++]) && !e.isPropagationStopped()) {
                    e.currentTarget = o.elem, a = 0;
                    while ((i = o.handlers[a++]) && !e.isImmediatePropagationStopped())(!e.namespace_re || e.namespace_re.test(i.namespace)) && (e.handleObj = i, e.data = i.data, r = ((x.event.special[i.origType] || {}).handle || i.handler).apply(o.elem, l), r !== t && (e.result = r) === !1 && (e.preventDefault(), e.stopPropagation()))
                }
                return c.postDispatch && c.postDispatch.call(this, e), e.result
            }
        },
        handlers: function(e, n) {
            var r, i, o, a, s = [],
                l = n.delegateCount,
                u = e.target;
            if (l && u.nodeType && (!e.button || "click" !== e.type))
                for (; u != this; u = u.parentNode || this)
                    if (1 === u.nodeType && (u.disabled !== !0 || "click" !== e.type)) {
                        for (o = [], a = 0; l > a; a++) i = n[a], r = i.selector + " ", o[r] === t && (o[r] = i.needsContext ? x(r, this).index(u) >= 0 : x.find(r, this, null, [u]).length), o[r] && o.push(i);
                        o.length && s.push({
                            elem: u,
                            handlers: o
                        })
                    }
            return n.length > l && s.push({
                elem: this,
                handlers: n.slice(l)
            }), s
        },
        fix: function(e) {
            if (e[x.expando]) return e;
            var t, n, r, i = e.type,
                o = e,
                s = this.fixHooks[i];
            s || (this.fixHooks[i] = s = tt.test(i) ? this.mouseHooks : et.test(i) ? this.keyHooks : {}), r = s.props ? this.props.concat(s.props) : this.props, e = new x.Event(o), t = r.length;
            while (t--) n = r[t], e[n] = o[n];
            return e.target || (e.target = o.srcElement || a), 3 === e.target.nodeType && (e.target = e.target.parentNode), e.metaKey = !!e.metaKey, s.filter ? s.filter(e, o) : e
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(e, t) {
                return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode), e
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(e, n) {
                var r, i, o, s = n.button,
                    l = n.fromElement;
                return null == e.pageX && null != n.clientX && (i = e.target.ownerDocument || a, o = i.documentElement, r = i.body, e.pageX = n.clientX + (o && o.scrollLeft || r && r.scrollLeft || 0) - (o && o.clientLeft || r && r.clientLeft || 0), e.pageY = n.clientY + (o && o.scrollTop || r && r.scrollTop || 0) - (o && o.clientTop || r && r.clientTop || 0)), !e.relatedTarget && l && (e.relatedTarget = l === e.target ? n.toElement : l), e.which || s === t || (e.which = 1 & s ? 1 : 2 & s ? 3 : 4 & s ? 2 : 0), e
            }
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                trigger: function() {
                    if (this !== at() && this.focus) try {
                        return this.focus(), !1
                    } catch (e) {}
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    return this === at() && this.blur ? (this.blur(), !1) : t
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function() {
                    return x.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), !1) : t
                },
                _default: function(e) {
                    return x.nodeName(e.target, "a")
                }
            },
            beforeunload: {
                postDispatch: function(e) {
                    e.result !== t && (e.originalEvent.returnValue = e.result)
                }
            }
        },
        simulate: function(e, t, n, r) {
            var i = x.extend(new x.Event, n, {
                type: e,
                isSimulated: !0,
                originalEvent: {}
            });
            r ? x.event.trigger(i, null, t) : x.event.dispatch.call(t, i), i.isDefaultPrevented() && n.preventDefault()
        }
    }, x.removeEvent = a.removeEventListener ? function(e, t, n) {
        e.removeEventListener && e.removeEventListener(t, n, !1)
    } : function(e, t, n) {
        var r = "on" + t;
        e.detachEvent && (typeof e[r] === i && (e[r] = null), e.detachEvent(r, n))
    }, x.Event = function(e, n) {
        return this instanceof x.Event ? (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.returnValue === !1 || e.getPreventDefault && e.getPreventDefault() ? it : ot) : this.type = e, n && x.extend(this, n), this.timeStamp = e && e.timeStamp || x.now(), this[x.expando] = !0, t) : new x.Event(e, n)
    }, x.Event.prototype = {
        isDefaultPrevented: ot,
        isPropagationStopped: ot,
        isImmediatePropagationStopped: ot,
        preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = it, e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
        },
        stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = it, e && (e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0)
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = it, this.stopPropagation()
        }
    }, x.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(e, t) {
        x.event.special[e] = {
            delegateType: t,
            bindType: t,
            handle: function(e) {
                var n, r = this,
                    i = e.relatedTarget,
                    o = e.handleObj;
                return (!i || i !== r && !x.contains(r, i)) && (e.type = o.origType, n = o.handler.apply(this, arguments), e.type = t), n
            }
        }
    }), x.support.submitBubbles || (x.event.special.submit = {
        setup: function() {
            return x.nodeName(this, "form") ? !1 : (x.event.add(this, "click._submit keypress._submit", function(e) {
                var n = e.target,
                    r = x.nodeName(n, "input") || x.nodeName(n, "button") ? n.form : t;
                r && !x._data(r, "submitBubbles") && (x.event.add(r, "submit._submit", function(e) {
                    e._submit_bubble = !0
                }), x._data(r, "submitBubbles", !0))
            }), t)
        },
        postDispatch: function(e) {
            e._submit_bubble && (delete e._submit_bubble, this.parentNode && !e.isTrigger && x.event.simulate("submit", this.parentNode, e, !0))
        },
        teardown: function() {
            return x.nodeName(this, "form") ? !1 : (x.event.remove(this, "._submit"), t)
        }
    }), x.support.changeBubbles || (x.event.special.change = {
        setup: function() {
            return Z.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (x.event.add(this, "propertychange._change", function(e) {
                "checked" === e.originalEvent.propertyName && (this._just_changed = !0)
            }), x.event.add(this, "click._change", function(e) {
                this._just_changed && !e.isTrigger && (this._just_changed = !1), x.event.simulate("change", this, e, !0)
            })), !1) : (x.event.add(this, "beforeactivate._change", function(e) {
                var t = e.target;
                Z.test(t.nodeName) && !x._data(t, "changeBubbles") && (x.event.add(t, "change._change", function(e) {
                    !this.parentNode || e.isSimulated || e.isTrigger || x.event.simulate("change", this.parentNode, e, !0)
                }), x._data(t, "changeBubbles", !0))
            }), t)
        },
        handle: function(e) {
            var n = e.target;
            return this !== n || e.isSimulated || e.isTrigger || "radio" !== n.type && "checkbox" !== n.type ? e.handleObj.handler.apply(this, arguments) : t
        },
        teardown: function() {
            return x.event.remove(this, "._change"), !Z.test(this.nodeName)
        }
    }), x.support.focusinBubbles || x.each({
        focus: "focusin",
        blur: "focusout"
    }, function(e, t) {
        var n = 0,
            r = function(e) {
                x.event.simulate(t, e.target, x.event.fix(e), !0)
            };
        x.event.special[t] = {
            setup: function() {
                0 === n++ && a.addEventListener(e, r, !0)
            },
            teardown: function() {
                0 === --n && a.removeEventListener(e, r, !0)
            }
        }
    }), x.fn.extend({
        on: function(e, n, r, i, o) {
            var a, s;
            if ("object" == typeof e) {
                "string" != typeof n && (r = r || n, n = t);
                for (a in e) this.on(a, n, r, e[a], o);
                return this
            }
            if (null == r && null == i ? (i = n, r = n = t) : null == i && ("string" == typeof n ? (i = r, r = t) : (i = r, r = n, n = t)), i === !1) i = ot;
            else if (!i) return this;
            return 1 === o && (s = i, i = function(e) {
                return x().off(e), s.apply(this, arguments)
            }, i.guid = s.guid || (s.guid = x.guid++)), this.each(function() {
                x.event.add(this, e, i, r, n)
            })
        },
        one: function(e, t, n, r) {
            return this.on(e, t, n, r, 1)
        },
        off: function(e, n, r) {
            var i, o;
            if (e && e.preventDefault && e.handleObj) return i = e.handleObj, x(e.delegateTarget).off(i.namespace ? i.origType + "." + i.namespace : i.origType, i.selector, i.handler), this;
            if ("object" == typeof e) {
                for (o in e) this.off(o, n, e[o]);
                return this
            }
            return (n === !1 || "function" == typeof n) && (r = n, n = t), r === !1 && (r = ot), this.each(function() {
                x.event.remove(this, e, r, n)
            })
        },
        trigger: function(e, t) {
            return this.each(function() {
                x.event.trigger(e, t, this)
            })
        },
        triggerHandler: function(e, n) {
            var r = this[0];
            return r ? x.event.trigger(e, n, r, !0) : t
        }
    });
    var st = /^.[^:#\[\.,]*$/,
        lt = /^(?:parents|prev(?:Until|All))/,
        ut = x.expr.match.needsContext,
        ct = {
            children: !0,
            contents: !0,
            next: !0,
            prev: !0
        };
    x.fn.extend({
        find: function(e) {
            var t, n = [],
                r = this,
                i = r.length;
            if ("string" != typeof e) return this.pushStack(x(e).filter(function() {
                for (t = 0; i > t; t++)
                    if (x.contains(r[t], this)) return !0
            }));
            for (t = 0; i > t; t++) x.find(e, r[t], n);
            return n = this.pushStack(i > 1 ? x.unique(n) : n), n.selector = this.selector ? this.selector + " " + e : e, n
        },
        has: function(e) {
            var t, n = x(e, this),
                r = n.length;
            return this.filter(function() {
                for (t = 0; r > t; t++)
                    if (x.contains(this, n[t])) return !0
            })
        },
        not: function(e) {
            return this.pushStack(ft(this, e || [], !0))
        },
        filter: function(e) {
            return this.pushStack(ft(this, e || [], !1))
        },
        is: function(e) {
            return !!ft(this, "string" == typeof e && ut.test(e) ? x(e) : e || [], !1).length
        },
        closest: function(e, t) {
            var n, r = 0,
                i = this.length,
                o = [],
                a = ut.test(e) || "string" != typeof e ? x(e, t || this.context) : 0;
            for (; i > r; r++)
                for (n = this[r]; n && n !== t; n = n.parentNode)
                    if (11 > n.nodeType && (a ? a.index(n) > -1 : 1 === n.nodeType && x.find.matchesSelector(n, e))) {
                        n = o.push(n);
                        break
                    }
            return this.pushStack(o.length > 1 ? x.unique(o) : o)
        },
        index: function(e) {
            return e ? "string" == typeof e ? x.inArray(this[0], x(e)) : x.inArray(e.jquery ? e[0] : e, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
        },
        add: function(e, t) {
            var n = "string" == typeof e ? x(e, t) : x.makeArray(e && e.nodeType ? [e] : e),
                r = x.merge(this.get(), n);
            return this.pushStack(x.unique(r))
        },
        addBack: function(e) {
            return this.add(null == e ? this.prevObject : this.prevObject.filter(e))
        }
    });

    function pt(e, t) {
        do e = e[t]; while (e && 1 !== e.nodeType);
        return e
    }
    x.each({
        parent: function(e) {
            var t = e.parentNode;
            return t && 11 !== t.nodeType ? t : null
        },
        parents: function(e) {
            return x.dir(e, "parentNode")
        },
        parentsUntil: function(e, t, n) {
            return x.dir(e, "parentNode", n)
        },
        next: function(e) {
            return pt(e, "nextSibling")
        },
        prev: function(e) {
            return pt(e, "previousSibling")
        },
        nextAll: function(e) {
            return x.dir(e, "nextSibling")
        },
        prevAll: function(e) {
            return x.dir(e, "previousSibling")
        },
        nextUntil: function(e, t, n) {
            return x.dir(e, "nextSibling", n)
        },
        prevUntil: function(e, t, n) {
            return x.dir(e, "previousSibling", n)
        },
        siblings: function(e) {
            return x.sibling((e.parentNode || {}).firstChild, e)
        },
        children: function(e) {
            return x.sibling(e.firstChild)
        },
        contents: function(e) {
            return x.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : x.merge([], e.childNodes)
        }
    }, function(e, t) {
        x.fn[e] = function(n, r) {
            var i = x.map(this, t, n);
            return "Until" !== e.slice(-5) && (r = n), r && "string" == typeof r && (i = x.filter(r, i)), this.length > 1 && (ct[e] || (i = x.unique(i)), lt.test(e) && (i = i.reverse())), this.pushStack(i)
        }
    }), x.extend({
        filter: function(e, t, n) {
            var r = t[0];
            return n && (e = ":not(" + e + ")"), 1 === t.length && 1 === r.nodeType ? x.find.matchesSelector(r, e) ? [r] : [] : x.find.matches(e, x.grep(t, function(e) {
                return 1 === e.nodeType
            }))
        },
        dir: function(e, n, r) {
            var i = [],
                o = e[n];
            while (o && 9 !== o.nodeType && (r === t || 1 !== o.nodeType || !x(o).is(r))) 1 === o.nodeType && i.push(o), o = o[n];
            return i
        },
        sibling: function(e, t) {
            var n = [];
            for (; e; e = e.nextSibling) 1 === e.nodeType && e !== t && n.push(e);
            return n
        }
    });

    function ft(e, t, n) {
        if (x.isFunction(t)) return x.grep(e, function(e, r) {
            return !!t.call(e, r, e) !== n
        });
        if (t.nodeType) return x.grep(e, function(e) {
            return e === t !== n
        });
        if ("string" == typeof t) {
            if (st.test(t)) return x.filter(t, e, n);
            t = x.filter(t, e)
        }
        return x.grep(e, function(e) {
            return x.inArray(e, t) >= 0 !== n
        })
    }

    function dt(e) {
        var t = ht.split("|"),
            n = e.createDocumentFragment();
        if (n.createElement)
            while (t.length) n.createElement(t.pop());
        return n
    }
    var ht = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        gt = / jQuery\d+="(?:null|\d+)"/g,
        mt = RegExp("<(?:" + ht + ")[\\s/>]", "i"),
        yt = /^\s+/,
        vt = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        bt = /<([\w:]+)/,
        xt = /<tbody/i,
        wt = /<|&#?\w+;/,
        Tt = /<(?:script|style|link)/i,
        Ct = /^(?:checkbox|radio)$/i,
        Nt = /checked\s*(?:[^=]|=\s*.checked.)/i,
        kt = /^$|\/(?:java|ecma)script/i,
        Et = /^true\/(.*)/,
        St = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
        At = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            area: [1, "<map>", "</map>"],
            param: [1, "<object>", "</object>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: x.support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
        },
        jt = dt(a),
        Dt = jt.appendChild(a.createElement("div"));
    At.optgroup = At.option, At.tbody = At.tfoot = At.colgroup = At.caption = At.thead, At.th = At.td, x.fn.extend({
        text: function(e) {
            return x.access(this, function(e) {
                return e === t ? x.text(this) : this.empty().append((this[0] && this[0].ownerDocument || a).createTextNode(e))
            }, null, e, arguments.length)
        },
        append: function() {
            return this.domManip(arguments, function(e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = Lt(this, e);
                    t.appendChild(e)
                }
            })
        },
        prepend: function() {
            return this.domManip(arguments, function(e) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var t = Lt(this, e);
                    t.insertBefore(e, t.firstChild)
                }
            })
        },
        before: function() {
            return this.domManip(arguments, function(e) {
                this.parentNode && this.parentNode.insertBefore(e, this)
            })
        },
        after: function() {
            return this.domManip(arguments, function(e) {
                this.parentNode && this.parentNode.insertBefore(e, this.nextSibling)
            })
        },
        remove: function(e, t) {
            var n, r = e ? x.filter(e, this) : this,
                i = 0;
            for (; null != (n = r[i]); i++) t || 1 !== n.nodeType || x.cleanData(Ft(n)), n.parentNode && (t && x.contains(n.ownerDocument, n) && _t(Ft(n, "script")), n.parentNode.removeChild(n));
            return this
        },
        empty: function() {
            var e, t = 0;
            for (; null != (e = this[t]); t++) {
                1 === e.nodeType && x.cleanData(Ft(e, !1));
                while (e.firstChild) e.removeChild(e.firstChild);
                e.options && x.nodeName(e, "select") && (e.options.length = 0)
            }
            return this
        },
        clone: function(e, t) {
            return e = null == e ? !1 : e, t = null == t ? e : t, this.map(function() {
                return x.clone(this, e, t)
            })
        },
        html: function(e) {
            return x.access(this, function(e) {
                var n = this[0] || {},
                    r = 0,
                    i = this.length;
                if (e === t) return 1 === n.nodeType ? n.innerHTML.replace(gt, "") : t;
                if (!("string" != typeof e || Tt.test(e) || !x.support.htmlSerialize && mt.test(e) || !x.support.leadingWhitespace && yt.test(e) || At[(bt.exec(e) || ["", ""])[1].toLowerCase()])) {
                    e = e.replace(vt, "<$1></$2>");
                    try {
                        for (; i > r; r++) n = this[r] || {}, 1 === n.nodeType && (x.cleanData(Ft(n, !1)), n.innerHTML = e);
                        n = 0
                    } catch (o) {}
                }
                n && this.empty().append(e)
            }, null, e, arguments.length)
        },
        replaceWith: function() {
            var e = x.map(this, function(e) {
                    return [e.nextSibling, e.parentNode]
                }),
                t = 0;
            return this.domManip(arguments, function(n) {
                var r = e[t++],
                    i = e[t++];
                i && (r && r.parentNode !== i && (r = this.nextSibling), x(this).remove(), i.insertBefore(n, r))
            }, !0), t ? this : this.remove()
        },
        detach: function(e) {
            return this.remove(e, !0)
        },
        domManip: function(e, t, n) {
            e = d.apply([], e);
            var r, i, o, a, s, l, u = 0,
                c = this.length,
                p = this,
                f = c - 1,
                h = e[0],
                g = x.isFunction(h);
            if (g || !(1 >= c || "string" != typeof h || x.support.checkClone) && Nt.test(h)) return this.each(function(r) {
                var i = p.eq(r);
                g && (e[0] = h.call(this, r, i.html())), i.domManip(e, t, n)
            });
            if (c && (l = x.buildFragment(e, this[0].ownerDocument, !1, !n && this), r = l.firstChild, 1 === l.childNodes.length && (l = r), r)) {
                for (a = x.map(Ft(l, "script"), Ht), o = a.length; c > u; u++) i = l, u !== f && (i = x.clone(i, !0, !0), o && x.merge(a, Ft(i, "script"))), t.call(this[u], i, u);
                if (o)
                    for (s = a[a.length - 1].ownerDocument, x.map(a, qt), u = 0; o > u; u++) i = a[u], kt.test(i.type || "") && !x._data(i, "globalEval") && x.contains(s, i) && (i.src ? x._evalUrl(i.src) : x.globalEval((i.text || i.textContent || i.innerHTML || "").replace(St, "")));
                l = r = null
            }
            return this
        }
    });

    function Lt(e, t) {
        return x.nodeName(e, "table") && x.nodeName(1 === t.nodeType ? t : t.firstChild, "tr") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
    }

    function Ht(e) {
        return e.type = (null !== x.find.attr(e, "type")) + "/" + e.type, e
    }

    function qt(e) {
        var t = Et.exec(e.type);
        return t ? e.type = t[1] : e.removeAttribute("type"), e
    }

    function _t(e, t) {
        var n, r = 0;
        for (; null != (n = e[r]); r++) x._data(n, "globalEval", !t || x._data(t[r], "globalEval"))
    }

    function Mt(e, t) {
        if (1 === t.nodeType && x.hasData(e)) {
            var n, r, i, o = x._data(e),
                a = x._data(t, o),
                s = o.events;
            if (s) {
                delete a.handle, a.events = {};
                for (n in s)
                    for (r = 0, i = s[n].length; i > r; r++) x.event.add(t, n, s[n][r])
            }
            a.data && (a.data = x.extend({}, a.data))
        }
    }

    function Ot(e, t) {
        var n, r, i;
        if (1 === t.nodeType) {
            if (n = t.nodeName.toLowerCase(), !x.support.noCloneEvent && t[x.expando]) {
                i = x._data(t);
                for (r in i.events) x.removeEvent(t, r, i.handle);
                t.removeAttribute(x.expando)
            }
            "script" === n && t.text !== e.text ? (Ht(t).text = e.text, qt(t)) : "object" === n ? (t.parentNode && (t.outerHTML = e.outerHTML), x.support.html5Clone && e.innerHTML && !x.trim(t.innerHTML) && (t.innerHTML = e.innerHTML)) : "input" === n && Ct.test(e.type) ? (t.defaultChecked = t.checked = e.checked, t.value !== e.value && (t.value = e.value)) : "option" === n ? t.defaultSelected = t.selected = e.defaultSelected : ("input" === n || "textarea" === n) && (t.defaultValue = e.defaultValue)
        }
    }
    x.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(e, t) {
        x.fn[e] = function(e) {
            var n, r = 0,
                i = [],
                o = x(e),
                a = o.length - 1;
            for (; a >= r; r++) n = r === a ? this : this.clone(!0), x(o[r])[t](n), h.apply(i, n.get());
            return this.pushStack(i)
        }
    });

    function Ft(e, n) {
        var r, o, a = 0,
            s = typeof e.getElementsByTagName !== i ? e.getElementsByTagName(n || "*") : typeof e.querySelectorAll !== i ? e.querySelectorAll(n || "*") : t;
        if (!s)
            for (s = [], r = e.childNodes || e; null != (o = r[a]); a++)!n || x.nodeName(o, n) ? s.push(o) : x.merge(s, Ft(o, n));
        return n === t || n && x.nodeName(e, n) ? x.merge([e], s) : s
    }

    function Bt(e) {
        Ct.test(e.type) && (e.defaultChecked = e.checked)
    }
    x.extend({
        clone: function(e, t, n) {
            var r, i, o, a, s, l = x.contains(e.ownerDocument, e);
            if (x.support.html5Clone || x.isXMLDoc(e) || !mt.test("<" + e.nodeName + ">") ? o = e.cloneNode(!0) : (Dt.innerHTML = e.outerHTML, Dt.removeChild(o = Dt.firstChild)), !(x.support.noCloneEvent && x.support.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || x.isXMLDoc(e)))
                for (r = Ft(o), s = Ft(e), a = 0; null != (i = s[a]); ++a) r[a] && Ot(i, r[a]);
            if (t)
                if (n)
                    for (s = s || Ft(e), r = r || Ft(o), a = 0; null != (i = s[a]); a++) Mt(i, r[a]);
                else Mt(e, o);
            return r = Ft(o, "script"), r.length > 0 && _t(r, !l && Ft(e, "script")), r = s = i = null, o
        },
        buildFragment: function(e, t, n, r) {
            var i, o, a, s, l, u, c, p = e.length,
                f = dt(t),
                d = [],
                h = 0;
            for (; p > h; h++)
                if (o = e[h], o || 0 === o)
                    if ("object" === x.type(o)) x.merge(d, o.nodeType ? [o] : o);
                    else if (wt.test(o)) {
                s = s || f.appendChild(t.createElement("div")), l = (bt.exec(o) || ["", ""])[1].toLowerCase(), c = At[l] || At._default, s.innerHTML = c[1] + o.replace(vt, "<$1></$2>") + c[2], i = c[0];
                while (i--) s = s.lastChild;
                if (!x.support.leadingWhitespace && yt.test(o) && d.push(t.createTextNode(yt.exec(o)[0])), !x.support.tbody) {
                    o = "table" !== l || xt.test(o) ? "<table>" !== c[1] || xt.test(o) ? 0 : s : s.firstChild, i = o && o.childNodes.length;
                    while (i--) x.nodeName(u = o.childNodes[i], "tbody") && !u.childNodes.length && o.removeChild(u)
                }
                x.merge(d, s.childNodes), s.textContent = "";
                while (s.firstChild) s.removeChild(s.firstChild);
                s = f.lastChild
            } else d.push(t.createTextNode(o));
            s && f.removeChild(s), x.support.appendChecked || x.grep(Ft(d, "input"), Bt), h = 0;
            while (o = d[h++])
                if ((!r || -1 === x.inArray(o, r)) && (a = x.contains(o.ownerDocument, o), s = Ft(f.appendChild(o), "script"), a && _t(s), n)) {
                    i = 0;
                    while (o = s[i++]) kt.test(o.type || "") && n.push(o)
                }
            return s = null, f
        },
        cleanData: function(e, t) {
            var n, r, o, a, s = 0,
                l = x.expando,
                u = x.cache,
                c = x.support.deleteExpando,
                f = x.event.special;
            for (; null != (n = e[s]); s++)
                if ((t || x.acceptData(n)) && (o = n[l], a = o && u[o])) {
                    if (a.events)
                        for (r in a.events) f[r] ? x.event.remove(n, r) : x.removeEvent(n, r, a.handle);
                    u[o] && (delete u[o], c ? delete n[l] : typeof n.removeAttribute !== i ? n.removeAttribute(l) : n[l] = null, p.push(o))
                }
        },
        _evalUrl: function(e) {
            return x.ajax({
                url: e,
                type: "GET",
                dataType: "script",
                async: !1,
                global: !1,
                "throws": !0
            })
        }
    }), x.fn.extend({
        wrapAll: function(e) {
            if (x.isFunction(e)) return this.each(function(t) {
                x(this).wrapAll(e.call(this, t))
            });
            if (this[0]) {
                var t = x(e, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
                    var e = this;
                    while (e.firstChild && 1 === e.firstChild.nodeType) e = e.firstChild;
                    return e
                }).append(this)
            }
            return this
        },
        wrapInner: function(e) {
            return x.isFunction(e) ? this.each(function(t) {
                x(this).wrapInner(e.call(this, t))
            }) : this.each(function() {
                var t = x(this),
                    n = t.contents();
                n.length ? n.wrapAll(e) : t.append(e)
            })
        },
        wrap: function(e) {
            var t = x.isFunction(e);
            return this.each(function(n) {
                x(this).wrapAll(t ? e.call(this, n) : e)
            })
        },
        unwrap: function() {
            return this.parent().each(function() {
                x.nodeName(this, "body") || x(this).replaceWith(this.childNodes)
            }).end()
        }
    });
    var Pt, Rt, Wt, $t = /alpha\([^)]*\)/i,
        It = /opacity\s*=\s*([^)]*)/,
        zt = /^(top|right|bottom|left)$/,
        Xt = /^(none|table(?!-c[ea]).+)/,
        Ut = /^margin/,
        Vt = RegExp("^(" + w + ")(.*)$", "i"),
        Yt = RegExp("^(" + w + ")(?!px)[a-z%]+$", "i"),
        Jt = RegExp("^([+-])=(" + w + ")", "i"),
        Gt = {
            BODY: "block"
        },
        Qt = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        Kt = {
            letterSpacing: 0,
            fontWeight: 400
        },
        Zt = ["Top", "Right", "Bottom", "Left"],
        en = ["Webkit", "O", "Moz", "ms"];

    function tn(e, t) {
        if (t in e) return t;
        var n = t.charAt(0).toUpperCase() + t.slice(1),
            r = t,
            i = en.length;
        while (i--)
            if (t = en[i] + n, t in e) return t;
        return r
    }

    function nn(e, t) {
        return e = t || e, "none" === x.css(e, "display") || !x.contains(e.ownerDocument, e)
    }

    function rn(e, t) {
        var n, r, i, o = [],
            a = 0,
            s = e.length;
        for (; s > a; a++) r = e[a], r.style && (o[a] = x._data(r, "olddisplay"), n = r.style.display, t ? (o[a] || "none" !== n || (r.style.display = ""), "" === r.style.display && nn(r) && (o[a] = x._data(r, "olddisplay", ln(r.nodeName)))) : o[a] || (i = nn(r), (n && "none" !== n || !i) && x._data(r, "olddisplay", i ? n : x.css(r, "display"))));
        for (a = 0; s > a; a++) r = e[a], r.style && (t && "none" !== r.style.display && "" !== r.style.display || (r.style.display = t ? o[a] || "" : "none"));
        return e
    }
    x.fn.extend({
        css: function(e, n) {
            return x.access(this, function(e, n, r) {
                var i, o, a = {},
                    s = 0;
                if (x.isArray(n)) {
                    for (o = Rt(e), i = n.length; i > s; s++) a[n[s]] = x.css(e, n[s], !1, o);
                    return a
                }
                return r !== t ? x.style(e, n, r) : x.css(e, n)
            }, e, n, arguments.length > 1)
        },
        show: function() {
            return rn(this, !0)
        },
        hide: function() {
            return rn(this)
        },
        toggle: function(e) {
            var t = "boolean" == typeof e;
            return this.each(function() {
                (t ? e : nn(this)) ? x(this).show() : x(this).hide()
            })
        }
    }), x.extend({
        cssHooks: {
            opacity: {
                get: function(e, t) {
                    if (t) {
                        var n = Wt(e, "opacity");
                        return "" === n ? "1" : n
                    }
                }
            }
        },
        cssNumber: {
            columnCount: !0,
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": x.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(e, n, r, i) {
            if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                var o, a, s, l = x.camelCase(n),
                    u = e.style;
                if (n = x.cssProps[l] || (x.cssProps[l] = tn(u, l)), s = x.cssHooks[n] || x.cssHooks[l], r === t) return s && "get" in s && (o = s.get(e, !1, i)) !== t ? o : u[n];
                if (a = typeof r, "string" === a && (o = Jt.exec(r)) && (r = (o[1] + 1) * o[2] + parseFloat(x.css(e, n)), a = "number"), !(null == r || "number" === a && isNaN(r) || ("number" !== a || x.cssNumber[l] || (r += "px"), x.support.clearCloneStyle || "" !== r || 0 !== n.indexOf("background") || (u[n] = "inherit"), s && "set" in s && (r = s.set(e, r, i)) === t))) try {
                    u[n] = r
                } catch (c) {}
            }
        },
        css: function(e, n, r, i) {
            var o, a, s, l = x.camelCase(n);
            return n = x.cssProps[l] || (x.cssProps[l] = tn(e.style, l)), s = x.cssHooks[n] || x.cssHooks[l], s && "get" in s && (a = s.get(e, !0, r)), a === t && (a = Wt(e, n, i)), "normal" === a && n in Kt && (a = Kt[n]), "" === r || r ? (o = parseFloat(a), r === !0 || x.isNumeric(o) ? o || 0 : a) : a
        }
    }), e.getComputedStyle ? (Rt = function(t) {
        return e.getComputedStyle(t, null)
    }, Wt = function(e, n, r) {
        var i, o, a, s = r || Rt(e),
            l = s ? s.getPropertyValue(n) || s[n] : t,
            u = e.style;
        return s && ("" !== l || x.contains(e.ownerDocument, e) || (l = x.style(e, n)), Yt.test(l) && Ut.test(n) && (i = u.width, o = u.minWidth, a = u.maxWidth, u.minWidth = u.maxWidth = u.width = l, l = s.width, u.width = i, u.minWidth = o, u.maxWidth = a)), l
    }) : a.documentElement.currentStyle && (Rt = function(e) {
        return e.currentStyle
    }, Wt = function(e, n, r) {
        var i, o, a, s = r || Rt(e),
            l = s ? s[n] : t,
            u = e.style;
        return null == l && u && u[n] && (l = u[n]), Yt.test(l) && !zt.test(n) && (i = u.left, o = e.runtimeStyle, a = o && o.left, a && (o.left = e.currentStyle.left), u.left = "fontSize" === n ? "1em" : l, l = u.pixelLeft + "px", u.left = i, a && (o.left = a)), "" === l ? "auto" : l
    });

    function on(e, t, n) {
        var r = Vt.exec(t);
        return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t
    }

    function an(e, t, n, r, i) {
        var o = n === (r ? "border" : "content") ? 4 : "width" === t ? 1 : 0,
            a = 0;
        for (; 4 > o; o += 2) "margin" === n && (a += x.css(e, n + Zt[o], !0, i)), r ? ("content" === n && (a -= x.css(e, "padding" + Zt[o], !0, i)), "margin" !== n && (a -= x.css(e, "border" + Zt[o] + "Width", !0, i))) : (a += x.css(e, "padding" + Zt[o], !0, i), "padding" !== n && (a += x.css(e, "border" + Zt[o] + "Width", !0, i)));
        return a
    }

    function sn(e, t, n) {
        var r = !0,
            i = "width" === t ? e.offsetWidth : e.offsetHeight,
            o = Rt(e),
            a = x.support.boxSizing && "border-box" === x.css(e, "boxSizing", !1, o);
        if (0 >= i || null == i) {
            if (i = Wt(e, t, o), (0 > i || null == i) && (i = e.style[t]), Yt.test(i)) return i;
            r = a && (x.support.boxSizingReliable || i === e.style[t]), i = parseFloat(i) || 0
        }
        return i + an(e, t, n || (a ? "border" : "content"), r, o) + "px"
    }

    function ln(e) {
        var t = a,
            n = Gt[e];
        return n || (n = un(e, t), "none" !== n && n || (Pt = (Pt || x("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(t.documentElement), t = (Pt[0].contentWindow || Pt[0].contentDocument).document, t.write("<!doctype html><html><body>"), t.close(), n = un(e, t), Pt.detach()), Gt[e] = n), n
    }

    function un(e, t) {
        var n = x(t.createElement(e)).appendTo(t.body),
            r = x.css(n[0], "display");
        return n.remove(), r
    }
    x.each(["height", "width"], function(e, n) {
        x.cssHooks[n] = {
            get: function(e, r, i) {
                return r ? 0 === e.offsetWidth && Xt.test(x.css(e, "display")) ? x.swap(e, Qt, function() {
                    return sn(e, n, i)
                }) : sn(e, n, i) : t
            },
            set: function(e, t, r) {
                var i = r && Rt(e);
                return on(e, t, r ? an(e, n, r, x.support.boxSizing && "border-box" === x.css(e, "boxSizing", !1, i), i) : 0)
            }
        }
    }), x.support.opacity || (x.cssHooks.opacity = {
        get: function(e, t) {
            return It.test((t && e.currentStyle ? e.currentStyle.filter : e.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : t ? "1" : ""
        },
        set: function(e, t) {
            var n = e.style,
                r = e.currentStyle,
                i = x.isNumeric(t) ? "alpha(opacity=" + 100 * t + ")" : "",
                o = r && r.filter || n.filter || "";
            n.zoom = 1, (t >= 1 || "" === t) && "" === x.trim(o.replace($t, "")) && n.removeAttribute && (n.removeAttribute("filter"), "" === t || r && !r.filter) || (n.filter = $t.test(o) ? o.replace($t, i) : o + " " + i)
        }
    }), x(function() {
        x.support.reliableMarginRight || (x.cssHooks.marginRight = {
            get: function(e, n) {
                return n ? x.swap(e, {
                    display: "inline-block"
                }, Wt, [e, "marginRight"]) : t
            }
        }), !x.support.pixelPosition && x.fn.position && x.each(["top", "left"], function(e, n) {
            x.cssHooks[n] = {
                get: function(e, r) {
                    return r ? (r = Wt(e, n), Yt.test(r) ? x(e).position()[n] + "px" : r) : t
                }
            }
        })
    }), x.expr && x.expr.filters && (x.expr.filters.hidden = function(e) {
        return 0 >= e.offsetWidth && 0 >= e.offsetHeight || !x.support.reliableHiddenOffsets && "none" === (e.style && e.style.display || x.css(e, "display"))
    }, x.expr.filters.visible = function(e) {
        return !x.expr.filters.hidden(e)
    }), x.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(e, t) {
        x.cssHooks[e + t] = {
            expand: function(n) {
                var r = 0,
                    i = {},
                    o = "string" == typeof n ? n.split(" ") : [n];
                for (; 4 > r; r++) i[e + Zt[r] + t] = o[r] || o[r - 2] || o[0];
                return i
            }
        }, Ut.test(e) || (x.cssHooks[e + t].set = on)
    });
    var cn = /%20/g,
        pn = /\[\]$/,
        fn = /\r?\n/g,
        dn = /^(?:submit|button|image|reset|file)$/i,
        hn = /^(?:input|select|textarea|keygen)/i;
    x.fn.extend({
        serialize: function() {
            return x.param(this.serializeArray())
        },
        serializeArray: function() {
            return this.map(function() {
                var e = x.prop(this, "elements");
                return e ? x.makeArray(e) : this
            }).filter(function() {
                var e = this.type;
                return this.name && !x(this).is(":disabled") && hn.test(this.nodeName) && !dn.test(e) && (this.checked || !Ct.test(e))
            }).map(function(e, t) {
                var n = x(this).val();
                return null == n ? null : x.isArray(n) ? x.map(n, function(e) {
                    return {
                        name: t.name,
                        value: e.replace(fn, "\r\n")
                    }
                }) : {
                    name: t.name,
                    value: n.replace(fn, "\r\n")
                }
            }).get()
        }
    }), x.param = function(e, n) {
        var r, i = [],
            o = function(e, t) {
                t = x.isFunction(t) ? t() : null == t ? "" : t, i[i.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
            };
        if (n === t && (n = x.ajaxSettings && x.ajaxSettings.traditional), x.isArray(e) || e.jquery && !x.isPlainObject(e)) x.each(e, function() {
            o(this.name, this.value)
        });
        else
            for (r in e) gn(r, e[r], n, o);
        return i.join("&").replace(cn, "+")
    };

    function gn(e, t, n, r) {
        var i;
        if (x.isArray(t)) x.each(t, function(t, i) {
            n || pn.test(e) ? r(e, i) : gn(e + "[" + ("object" == typeof i ? t : "") + "]", i, n, r)
        });
        else if (n || "object" !== x.type(t)) r(e, t);
        else
            for (i in t) gn(e + "[" + i + "]", t[i], n, r)
    }
    x.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
        x.fn[t] = function(e, n) {
            return arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
        }
    }), x.fn.extend({
        hover: function(e, t) {
            return this.mouseenter(e).mouseleave(t || e)
        },
        bind: function(e, t, n) {
            return this.on(e, null, t, n)
        },
        unbind: function(e, t) {
            return this.off(e, null, t)
        },
        delegate: function(e, t, n, r) {
            return this.on(t, e, n, r)
        },
        undelegate: function(e, t, n) {
            return 1 === arguments.length ? this.off(e, "**") : this.off(t, e || "**", n)
        }
    });
    var mn, yn, vn = x.now(),
        bn = /\?/,
        xn = /#.*$/,
        wn = /([?&])_=[^&]*/,
        Tn = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
        Cn = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        Nn = /^(?:GET|HEAD)$/,
        kn = /^\/\//,
        En = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
        Sn = x.fn.load,
        An = {},
        jn = {},
        Dn = "*/".concat("*");
    try {
        yn = o.href
    } catch (Ln) {
        yn = a.createElement("a"), yn.href = "", yn = yn.href
    }
    mn = En.exec(yn.toLowerCase()) || [];

    function Hn(e) {
        return function(t, n) {
            "string" != typeof t && (n = t, t = "*");
            var r, i = 0,
                o = t.toLowerCase().match(T) || [];
            if (x.isFunction(n))
                while (r = o[i++]) "+" === r[0] ? (r = r.slice(1) || "*", (e[r] = e[r] || []).unshift(n)) : (e[r] = e[r] || []).push(n)
        }
    }

    function qn(e, n, r, i) {
        var o = {},
            a = e === jn;

        function s(l) {
            var u;
            return o[l] = !0, x.each(e[l] || [], function(e, l) {
                var c = l(n, r, i);
                return "string" != typeof c || a || o[c] ? a ? !(u = c) : t : (n.dataTypes.unshift(c), s(c), !1)
            }), u
        }
        return s(n.dataTypes[0]) || !o["*"] && s("*")
    }

    function _n(e, n) {
        var r, i, o = x.ajaxSettings.flatOptions || {};
        for (i in n) n[i] !== t && ((o[i] ? e : r || (r = {}))[i] = n[i]);
        return r && x.extend(!0, e, r), e
    }
    x.fn.load = function(e, n, r) {
        if ("string" != typeof e && Sn) return Sn.apply(this, arguments);
        var i, o, a, s = this,
            l = e.indexOf(" ");
        return l >= 0 && (i = e.slice(l, e.length), e = e.slice(0, l)), x.isFunction(n) ? (r = n, n = t) : n && "object" == typeof n && (a = "POST"), s.length > 0 && x.ajax({
            url: e,
            type: a,
            dataType: "html",
            data: n
        }).done(function(e) {
            o = arguments, s.html(i ? x("<div>").append(x.parseHTML(e)).find(i) : e)
        }).complete(r && function(e, t) {
            s.each(r, o || [e.responseText, t, e])
        }), this
    }, x.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(e, t) {
        x.fn[t] = function(e) {
            return this.on(t, e)
        }
    }), x.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: yn,
            type: "GET",
            isLocal: Cn.test(mn[1]),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": Dn,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": x.parseJSON,
                "text xml": x.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function(e, t) {
            return t ? _n(_n(e, x.ajaxSettings), t) : _n(x.ajaxSettings, e)
        },
        ajaxPrefilter: Hn(An),
        ajaxTransport: Hn(jn),
        ajax: function(e, n) {
            "object" == typeof e && (n = e, e = t), n = n || {};
            var r, i, o, a, s, l, u, c, p = x.ajaxSetup({}, n),
                f = p.context || p,
                d = p.context && (f.nodeType || f.jquery) ? x(f) : x.event,
                h = x.Deferred(),
                g = x.Callbacks("once memory"),
                m = p.statusCode || {},
                y = {},
                v = {},
                b = 0,
                w = "canceled",
                C = {
                    readyState: 0,
                    getResponseHeader: function(e) {
                        var t;
                        if (2 === b) {
                            if (!c) {
                                c = {};
                                while (t = Tn.exec(a)) c[t[1].toLowerCase()] = t[2]
                            }
                            t = c[e.toLowerCase()]
                        }
                        return null == t ? null : t
                    },
                    getAllResponseHeaders: function() {
                        return 2 === b ? a : null
                    },
                    setRequestHeader: function(e, t) {
                        var n = e.toLowerCase();
                        return b || (e = v[n] = v[n] || e, y[e] = t), this
                    },
                    overrideMimeType: function(e) {
                        return b || (p.mimeType = e), this
                    },
                    statusCode: function(e) {
                        var t;
                        if (e)
                            if (2 > b)
                                for (t in e) m[t] = [m[t], e[t]];
                            else C.always(e[C.status]);
                        return this
                    },
                    abort: function(e) {
                        var t = e || w;
                        return u && u.abort(t), k(0, t), this
                    }
                };
            if (h.promise(C).complete = g.add, C.success = C.done, C.error = C.fail, p.url = ((e || p.url || yn) + "").replace(xn, "").replace(kn, mn[1] + "//"), p.type = n.method || n.type || p.method || p.type, p.dataTypes = x.trim(p.dataType || "*").toLowerCase().match(T) || [""], null == p.crossDomain && (r = En.exec(p.url.toLowerCase()), p.crossDomain = !(!r || r[1] === mn[1] && r[2] === mn[2] && (r[3] || ("http:" === r[1] ? "80" : "443")) === (mn[3] || ("http:" === mn[1] ? "80" : "443")))), p.data && p.processData && "string" != typeof p.data && (p.data = x.param(p.data, p.traditional)), qn(An, p, n, C), 2 === b) return C;
            l = p.global, l && 0 === x.active++ && x.event.trigger("ajaxStart"), p.type = p.type.toUpperCase(), p.hasContent = !Nn.test(p.type), o = p.url, p.hasContent || (p.data && (o = p.url += (bn.test(o) ? "&" : "?") + p.data, delete p.data), p.cache === !1 && (p.url = wn.test(o) ? o.replace(wn, "$1_=" + vn++) : o + (bn.test(o) ? "&" : "?") + "_=" + vn++)), p.ifModified && (x.lastModified[o] && C.setRequestHeader("If-Modified-Since", x.lastModified[o]), x.etag[o] && C.setRequestHeader("If-None-Match", x.etag[o])), (p.data && p.hasContent && p.contentType !== !1 || n.contentType) && C.setRequestHeader("Content-Type", p.contentType), C.setRequestHeader("Accept", p.dataTypes[0] && p.accepts[p.dataTypes[0]] ? p.accepts[p.dataTypes[0]] + ("*" !== p.dataTypes[0] ? ", " + Dn + "; q=0.01" : "") : p.accepts["*"]);
            for (i in p.headers) C.setRequestHeader(i, p.headers[i]);
            if (p.beforeSend && (p.beforeSend.call(f, C, p) === !1 || 2 === b)) return C.abort();
            w = "abort";
            for (i in {
                success: 1,
                error: 1,
                complete: 1
            }) C[i](p[i]);
            if (u = qn(jn, p, n, C)) {
                C.readyState = 1, l && d.trigger("ajaxSend", [C, p]), p.async && p.timeout > 0 && (s = setTimeout(function() {
                    C.abort("timeout")
                }, p.timeout));
                try {
                    b = 1, u.send(y, k)
                } catch (N) {
                    if (!(2 > b)) throw N;
                    k(-1, N)
                }
            } else k(-1, "No Transport");

            function k(e, n, r, i) {
                var c, y, v, w, T, N = n;
                2 !== b && (b = 2, s && clearTimeout(s), u = t, a = i || "", C.readyState = e > 0 ? 4 : 0, c = e >= 200 && 300 > e || 304 === e, r && (w = Mn(p, C, r)), w = On(p, w, C, c), c ? (p.ifModified && (T = C.getResponseHeader("Last-Modified"), T && (x.lastModified[o] = T), T = C.getResponseHeader("etag"), T && (x.etag[o] = T)), 204 === e || "HEAD" === p.type ? N = "nocontent" : 304 === e ? N = "notmodified" : (N = w.state, y = w.data, v = w.error, c = !v)) : (v = N, (e || !N) && (N = "error", 0 > e && (e = 0))), C.status = e, C.statusText = (n || N) + "", c ? h.resolveWith(f, [y, N, C]) : h.rejectWith(f, [C, N, v]), C.statusCode(m), m = t, l && d.trigger(c ? "ajaxSuccess" : "ajaxError", [C, p, c ? y : v]), g.fireWith(f, [C, N]), l && (d.trigger("ajaxComplete", [C, p]), --x.active || x.event.trigger("ajaxStop")))
            }
            return C
        },
        getJSON: function(e, t, n) {
            return x.get(e, t, n, "json")
        },
        getScript: function(e, n) {
            return x.get(e, t, n, "script")
        }
    }), x.each(["get", "post"], function(e, n) {
        x[n] = function(e, r, i, o) {
            return x.isFunction(r) && (o = o || i, i = r, r = t), x.ajax({
                url: e,
                type: n,
                dataType: o,
                data: r,
                success: i
            })
        }
    });

    function Mn(e, n, r) {
        var i, o, a, s, l = e.contents,
            u = e.dataTypes;
        while ("*" === u[0]) u.shift(), o === t && (o = e.mimeType || n.getResponseHeader("Content-Type"));
        if (o)
            for (s in l)
                if (l[s] && l[s].test(o)) {
                    u.unshift(s);
                    break
                }
        if (u[0] in r) a = u[0];
        else {
            for (s in r) {
                if (!u[0] || e.converters[s + " " + u[0]]) {
                    a = s;
                    break
                }
                i || (i = s)
            }
            a = a || i
        }
        return a ? (a !== u[0] && u.unshift(a), r[a]) : t
    }

    function On(e, t, n, r) {
        var i, o, a, s, l, u = {},
            c = e.dataTypes.slice();
        if (c[1])
            for (a in e.converters) u[a.toLowerCase()] = e.converters[a];
        o = c.shift();
        while (o)
            if (e.responseFields[o] && (n[e.responseFields[o]] = t), !l && r && e.dataFilter && (t = e.dataFilter(t, e.dataType)), l = o, o = c.shift())
                if ("*" === o) o = l;
                else if ("*" !== l && l !== o) {
            if (a = u[l + " " + o] || u["* " + o], !a)
                for (i in u)
                    if (s = i.split(" "), s[1] === o && (a = u[l + " " + s[0]] || u["* " + s[0]])) {
                        a === !0 ? a = u[i] : u[i] !== !0 && (o = s[0], c.unshift(s[1]));
                        break
                    }
            if (a !== !0)
                if (a && e["throws"]) t = a(t);
                else try {
                    t = a(t)
                } catch (p) {
                    return {
                        state: "parsererror",
                        error: a ? p : "No conversion from " + l + " to " + o
                    }
                }
        }
        return {
            state: "success",
            data: t
        }
    }
    x.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(e) {
                return x.globalEval(e), e
            }
        }
    }), x.ajaxPrefilter("script", function(e) {
        e.cache === t && (e.cache = !1), e.crossDomain && (e.type = "GET", e.global = !1)
    }), x.ajaxTransport("script", function(e) {
        if (e.crossDomain) {
            var n, r = a.head || x("head")[0] || a.documentElement;
            return {
                send: function(t, i) {
                    n = a.createElement("script"), n.async = !0, e.scriptCharset && (n.charset = e.scriptCharset), n.src = e.url, n.onload = n.onreadystatechange = function(e, t) {
                        (t || !n.readyState || /loaded|complete/.test(n.readyState)) && (n.onload = n.onreadystatechange = null, n.parentNode && n.parentNode.removeChild(n), n = null, t || i(200, "success"))
                    }, r.insertBefore(n, r.firstChild)
                },
                abort: function() {
                    n && n.onload(t, !0)
                }
            }
        }
    });
    var Fn = [],
        Bn = /(=)\?(?=&|$)|\?\?/;
    x.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var e = Fn.pop() || x.expando + "_" + vn++;
            return this[e] = !0, e
        }
    }), x.ajaxPrefilter("json jsonp", function(n, r, i) {
        var o, a, s, l = n.jsonp !== !1 && (Bn.test(n.url) ? "url" : "string" == typeof n.data && !(n.contentType || "").indexOf("application/x-www-form-urlencoded") && Bn.test(n.data) && "data");
        return l || "jsonp" === n.dataTypes[0] ? (o = n.jsonpCallback = x.isFunction(n.jsonpCallback) ? n.jsonpCallback() : n.jsonpCallback, l ? n[l] = n[l].replace(Bn, "$1" + o) : n.jsonp !== !1 && (n.url += (bn.test(n.url) ? "&" : "?") + n.jsonp + "=" + o), n.converters["script json"] = function() {
            return s || x.error(o + " was not called"), s[0]
        }, n.dataTypes[0] = "json", a = e[o], e[o] = function() {
            s = arguments
        }, i.always(function() {
            e[o] = a, n[o] && (n.jsonpCallback = r.jsonpCallback, Fn.push(o)), s && x.isFunction(a) && a(s[0]), s = a = t
        }), "script") : t
    });
    var Pn, Rn, Wn = 0,
        $n = e.ActiveXObject && function() {
            var e;
            for (e in Pn) Pn[e](t, !0)
        };

    function In() {
        try {
            return new e.XMLHttpRequest
        } catch (t) {}
    }

    function zn() {
        try {
            return new e.ActiveXObject("Microsoft.XMLHTTP")
        } catch (t) {}
    }
    x.ajaxSettings.xhr = e.ActiveXObject ? function() {
        return !this.isLocal && In() || zn()
    } : In, Rn = x.ajaxSettings.xhr(), x.support.cors = !!Rn && "withCredentials" in Rn, Rn = x.support.ajax = !!Rn, Rn && x.ajaxTransport(function(n) {
        if (!n.crossDomain || x.support.cors) {
            var r;
            return {
                send: function(i, o) {
                    var a, s, l = n.xhr();
                    if (n.username ? l.open(n.type, n.url, n.async, n.username, n.password) : l.open(n.type, n.url, n.async), n.xhrFields)
                        for (s in n.xhrFields) l[s] = n.xhrFields[s];
                    n.mimeType && l.overrideMimeType && l.overrideMimeType(n.mimeType), n.crossDomain || i["X-Requested-With"] || (i["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (s in i) l.setRequestHeader(s, i[s])
                    } catch (u) {}
                    l.send(n.hasContent && n.data || null), r = function(e, i) {
                        var s, u, c, p;
                        try {
                            if (r && (i || 4 === l.readyState))
                                if (r = t, a && (l.onreadystatechange = x.noop, $n && delete Pn[a]), i) 4 !== l.readyState && l.abort();
                                else {
                                    p = {}, s = l.status, u = l.getAllResponseHeaders(), "string" == typeof l.responseText && (p.text = l.responseText);
                                    try {
                                        c = l.statusText
                                    } catch (f) {
                                        c = ""
                                    }
                                    s || !n.isLocal || n.crossDomain ? 1223 === s && (s = 204) : s = p.text ? 200 : 404
                                }
                        } catch (d) {
                            i || o(-1, d)
                        }
                        p && o(s, c, p, u)
                    }, n.async ? 4 === l.readyState ? setTimeout(r) : (a = ++Wn, $n && (Pn || (Pn = {}, x(e).unload($n)), Pn[a] = r), l.onreadystatechange = r) : r()
                },
                abort: function() {
                    r && r(t, !0)
                }
            }
        }
    });
    var Xn, Un, Vn = /^(?:toggle|show|hide)$/,
        Yn = RegExp("^(?:([+-])=|)(" + w + ")([a-z%]*)$", "i"),
        Jn = /queueHooks$/,
        Gn = [nr],
        Qn = {
            "*": [
                function(e, t) {
                    var n = this.createTween(e, t),
                        r = n.cur(),
                        i = Yn.exec(t),
                        o = i && i[3] || (x.cssNumber[e] ? "" : "px"),
                        a = (x.cssNumber[e] || "px" !== o && +r) && Yn.exec(x.css(n.elem, e)),
                        s = 1,
                        l = 20;
                    if (a && a[3] !== o) {
                        o = o || a[3], i = i || [], a = +r || 1;
                        do s = s || ".5", a /= s, x.style(n.elem, e, a + o); while (s !== (s = n.cur() / r) && 1 !== s && --l)
                    }
                    return i && (a = n.start = +a || +r || 0, n.unit = o, n.end = i[1] ? a + (i[1] + 1) * i[2] : +i[2]), n
                }
            ]
        };

    function Kn() {
        return setTimeout(function() {
            Xn = t
        }), Xn = x.now()
    }

    function Zn(e, t, n) {
        var r, i = (Qn[t] || []).concat(Qn["*"]),
            o = 0,
            a = i.length;
        for (; a > o; o++)
            if (r = i[o].call(n, t, e)) return r
    }

    function er(e, t, n) {
        var r, i, o = 0,
            a = Gn.length,
            s = x.Deferred().always(function() {
                delete l.elem
            }),
            l = function() {
                if (i) return !1;
                var t = Xn || Kn(),
                    n = Math.max(0, u.startTime + u.duration - t),
                    r = n / u.duration || 0,
                    o = 1 - r,
                    a = 0,
                    l = u.tweens.length;
                for (; l > a; a++) u.tweens[a].run(o);
                return s.notifyWith(e, [u, o, n]), 1 > o && l ? n : (s.resolveWith(e, [u]), !1)
            },
            u = s.promise({
                elem: e,
                props: x.extend({}, t),
                opts: x.extend(!0, {
                    specialEasing: {}
                }, n),
                originalProperties: t,
                originalOptions: n,
                startTime: Xn || Kn(),
                duration: n.duration,
                tweens: [],
                createTween: function(t, n) {
                    var r = x.Tween(e, u.opts, t, n, u.opts.specialEasing[t] || u.opts.easing);
                    return u.tweens.push(r), r
                },
                stop: function(t) {
                    var n = 0,
                        r = t ? u.tweens.length : 0;
                    if (i) return this;
                    for (i = !0; r > n; n++) u.tweens[n].run(1);
                    return t ? s.resolveWith(e, [u, t]) : s.rejectWith(e, [u, t]), this
                }
            }),
            c = u.props;
        for (tr(c, u.opts.specialEasing); a > o; o++)
            if (r = Gn[o].call(u, e, c, u.opts)) return r;
        return x.map(c, Zn, u), x.isFunction(u.opts.start) && u.opts.start.call(e, u), x.fx.timer(x.extend(l, {
            elem: e,
            anim: u,
            queue: u.opts.queue
        })), u.progress(u.opts.progress).done(u.opts.done, u.opts.complete).fail(u.opts.fail).always(u.opts.always)
    }

    function tr(e, t) {
        var n, r, i, o, a;
        for (n in e)
            if (r = x.camelCase(n), i = t[r], o = e[n], x.isArray(o) && (i = o[1], o = e[n] = o[0]), n !== r && (e[r] = o, delete e[n]), a = x.cssHooks[r], a && "expand" in a) {
                o = a.expand(o), delete e[r];
                for (n in o) n in e || (e[n] = o[n], t[n] = i)
            } else t[r] = i
    }
    x.Animation = x.extend(er, {
        tweener: function(e, t) {
            x.isFunction(e) ? (t = e, e = ["*"]) : e = e.split(" ");
            var n, r = 0,
                i = e.length;
            for (; i > r; r++) n = e[r], Qn[n] = Qn[n] || [], Qn[n].unshift(t)
        },
        prefilter: function(e, t) {
            t ? Gn.unshift(e) : Gn.push(e)
        }
    });

    function nr(e, t, n) {
        var r, i, o, a, s, l, u = this,
            c = {},
            p = e.style,
            f = e.nodeType && nn(e),
            d = x._data(e, "fxshow");
        n.queue || (s = x._queueHooks(e, "fx"), null == s.unqueued && (s.unqueued = 0, l = s.empty.fire, s.empty.fire = function() {
            s.unqueued || l()
        }), s.unqueued++, u.always(function() {
            u.always(function() {
                s.unqueued--, x.queue(e, "fx").length || s.empty.fire()
            })
        })), 1 === e.nodeType && ("height" in t || "width" in t) && (n.overflow = [p.overflow, p.overflowX, p.overflowY], "inline" === x.css(e, "display") && "none" === x.css(e, "float") && (x.support.inlineBlockNeedsLayout && "inline" !== ln(e.nodeName) ? p.zoom = 1 : p.display = "inline-block")), n.overflow && (p.overflow = "hidden", x.support.shrinkWrapBlocks || u.always(function() {
            p.overflow = n.overflow[0], p.overflowX = n.overflow[1], p.overflowY = n.overflow[2]
        }));
        for (r in t)
            if (i = t[r], Vn.exec(i)) {
                if (delete t[r], o = o || "toggle" === i, i === (f ? "hide" : "show")) continue;
                c[r] = d && d[r] || x.style(e, r)
            }
        if (!x.isEmptyObject(c)) {
            d ? "hidden" in d && (f = d.hidden) : d = x._data(e, "fxshow", {}), o && (d.hidden = !f), f ? x(e).show() : u.done(function() {
                x(e).hide()
            }), u.done(function() {
                var t;
                x._removeData(e, "fxshow");
                for (t in c) x.style(e, t, c[t])
            });
            for (r in c) a = Zn(f ? d[r] : 0, r, u), r in d || (d[r] = a.start, f && (a.end = a.start, a.start = "width" === r || "height" === r ? 1 : 0))
        }
    }

    function rr(e, t, n, r, i) {
        return new rr.prototype.init(e, t, n, r, i)
    }
    x.Tween = rr, rr.prototype = {
        constructor: rr,
        init: function(e, t, n, r, i, o) {
            this.elem = e, this.prop = n, this.easing = i || "swing", this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = o || (x.cssNumber[n] ? "" : "px")
        },
        cur: function() {
            var e = rr.propHooks[this.prop];
            return e && e.get ? e.get(this) : rr.propHooks._default.get(this)
        },
        run: function(e) {
            var t, n = rr.propHooks[this.prop];
            return this.pos = t = this.options.duration ? x.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : rr.propHooks._default.set(this), this
        }
    }, rr.prototype.init.prototype = rr.prototype, rr.propHooks = {
        _default: {
            get: function(e) {
                var t;
                return null == e.elem[e.prop] || e.elem.style && null != e.elem.style[e.prop] ? (t = x.css(e.elem, e.prop, ""), t && "auto" !== t ? t : 0) : e.elem[e.prop]
            },
            set: function(e) {
                x.fx.step[e.prop] ? x.fx.step[e.prop](e) : e.elem.style && (null != e.elem.style[x.cssProps[e.prop]] || x.cssHooks[e.prop]) ? x.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now
            }
        }
    }, rr.propHooks.scrollTop = rr.propHooks.scrollLeft = {
        set: function(e) {
            e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now)
        }
    }, x.each(["toggle", "show", "hide"], function(e, t) {
        var n = x.fn[t];
        x.fn[t] = function(e, r, i) {
            return null == e || "boolean" == typeof e ? n.apply(this, arguments) : this.animate(ir(t, !0), e, r, i)
        }
    }), x.fn.extend({
        fadeTo: function(e, t, n, r) {
            return this.filter(nn).css("opacity", 0).show().end().animate({
                opacity: t
            }, e, n, r)
        },
        animate: function(e, t, n, r) {
            var i = x.isEmptyObject(e),
                o = x.speed(t, n, r),
                a = function() {
                    var t = er(this, x.extend({}, e), o);
                    (i || x._data(this, "finish")) && t.stop(!0)
                };
            return a.finish = a, i || o.queue === !1 ? this.each(a) : this.queue(o.queue, a)
        },
        stop: function(e, n, r) {
            var i = function(e) {
                var t = e.stop;
                delete e.stop, t(r)
            };
            return "string" != typeof e && (r = n, n = e, e = t), n && e !== !1 && this.queue(e || "fx", []), this.each(function() {
                var t = !0,
                    n = null != e && e + "queueHooks",
                    o = x.timers,
                    a = x._data(this);
                if (n) a[n] && a[n].stop && i(a[n]);
                else
                    for (n in a) a[n] && a[n].stop && Jn.test(n) && i(a[n]);
                for (n = o.length; n--;) o[n].elem !== this || null != e && o[n].queue !== e || (o[n].anim.stop(r), t = !1, o.splice(n, 1));
                (t || !r) && x.dequeue(this, e)
            })
        },
        finish: function(e) {
            return e !== !1 && (e = e || "fx"), this.each(function() {
                var t, n = x._data(this),
                    r = n[e + "queue"],
                    i = n[e + "queueHooks"],
                    o = x.timers,
                    a = r ? r.length : 0;
                for (n.finish = !0, x.queue(this, e, []), i && i.stop && i.stop.call(this, !0), t = o.length; t--;) o[t].elem === this && o[t].queue === e && (o[t].anim.stop(!0), o.splice(t, 1));
                for (t = 0; a > t; t++) r[t] && r[t].finish && r[t].finish.call(this);
                delete n.finish
            })
        }
    });

    function ir(e, t) {
        var n, r = {
                height: e
            },
            i = 0;
        for (t = t ? 1 : 0; 4 > i; i += 2 - t) n = Zt[i], r["margin" + n] = r["padding" + n] = e;
        return t && (r.opacity = r.width = e), r
    }
    x.each({
        slideDown: ir("show"),
        slideUp: ir("hide"),
        slideToggle: ir("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(e, t) {
        x.fn[e] = function(e, n, r) {
            return this.animate(t, e, n, r)
        }
    }), x.speed = function(e, t, n) {
        var r = e && "object" == typeof e ? x.extend({}, e) : {
            complete: n || !n && t || x.isFunction(e) && e,
            duration: e,
            easing: n && t || t && !x.isFunction(t) && t
        };
        return r.duration = x.fx.off ? 0 : "number" == typeof r.duration ? r.duration : r.duration in x.fx.speeds ? x.fx.speeds[r.duration] : x.fx.speeds._default, (null == r.queue || r.queue === !0) && (r.queue = "fx"), r.old = r.complete, r.complete = function() {
            x.isFunction(r.old) && r.old.call(this), r.queue && x.dequeue(this, r.queue)
        }, r
    }, x.easing = {
        linear: function(e) {
            return e
        },
        swing: function(e) {
            return .5 - Math.cos(e * Math.PI) / 2
        }
    }, x.timers = [], x.fx = rr.prototype.init, x.fx.tick = function() {
        var e, n = x.timers,
            r = 0;
        for (Xn = x.now(); n.length > r; r++) e = n[r], e() || n[r] !== e || n.splice(r--, 1);
        n.length || x.fx.stop(), Xn = t
    }, x.fx.timer = function(e) {
        e() && x.timers.push(e) && x.fx.start()
    }, x.fx.interval = 13, x.fx.start = function() {
        Un || (Un = setInterval(x.fx.tick, x.fx.interval))
    }, x.fx.stop = function() {
        clearInterval(Un), Un = null
    }, x.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    }, x.fx.step = {}, x.expr && x.expr.filters && (x.expr.filters.animated = function(e) {
        return x.grep(x.timers, function(t) {
            return e === t.elem
        }).length
    }), x.fn.offset = function(e) {
        if (arguments.length) return e === t ? this : this.each(function(t) {
            x.offset.setOffset(this, e, t)
        });
        var n, r, o = {
                top: 0,
                left: 0
            },
            a = this[0],
            s = a && a.ownerDocument;
        if (s) return n = s.documentElement, x.contains(n, a) ? (typeof a.getBoundingClientRect !== i && (o = a.getBoundingClientRect()), r = or(s), {
            top: o.top + (r.pageYOffset || n.scrollTop) - (n.clientTop || 0),
            left: o.left + (r.pageXOffset || n.scrollLeft) - (n.clientLeft || 0)
        }) : o
    }, x.offset = {
        setOffset: function(e, t, n) {
            var r = x.css(e, "position");
            "static" === r && (e.style.position = "relative");
            var i = x(e),
                o = i.offset(),
                a = x.css(e, "top"),
                s = x.css(e, "left"),
                l = ("absolute" === r || "fixed" === r) && x.inArray("auto", [a, s]) > -1,
                u = {},
                c = {},
                p, f;
            l ? (c = i.position(), p = c.top, f = c.left) : (p = parseFloat(a) || 0, f = parseFloat(s) || 0), x.isFunction(t) && (t = t.call(e, n, o)), null != t.top && (u.top = t.top - o.top + p), null != t.left && (u.left = t.left - o.left + f), "using" in t ? t.using.call(e, u) : i.css(u)
        }
    }, x.fn.extend({
        position: function() {
            if (this[0]) {
                var e, t, n = {
                        top: 0,
                        left: 0
                    },
                    r = this[0];
                return "fixed" === x.css(r, "position") ? t = r.getBoundingClientRect() : (e = this.offsetParent(), t = this.offset(), x.nodeName(e[0], "html") || (n = e.offset()), n.top += x.css(e[0], "borderTopWidth", !0), n.left += x.css(e[0], "borderLeftWidth", !0)), {
                    top: t.top - n.top - x.css(r, "marginTop", !0),
                    left: t.left - n.left - x.css(r, "marginLeft", !0)
                }
            }
        },
        offsetParent: function() {
            return this.map(function() {
                var e = this.offsetParent || s;
                while (e && !x.nodeName(e, "html") && "static" === x.css(e, "position")) e = e.offsetParent;
                return e || s
            })
        }
    }), x.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(e, n) {
        var r = /Y/.test(n);
        x.fn[e] = function(i) {
            return x.access(this, function(e, i, o) {
                var a = or(e);
                return o === t ? a ? n in a ? a[n] : a.document.documentElement[i] : e[i] : (a ? a.scrollTo(r ? x(a).scrollLeft() : o, r ? o : x(a).scrollTop()) : e[i] = o, t)
            }, e, i, arguments.length, null)
        }
    });

    function or(e) {
        return x.isWindow(e) ? e : 9 === e.nodeType ? e.defaultView || e.parentWindow : !1
    }
    x.each({
        Height: "height",
        Width: "width"
    }, function(e, n) {
        x.each({
            padding: "inner" + e,
            content: n,
            "": "outer" + e
        }, function(r, i) {
            x.fn[i] = function(i, o) {
                var a = arguments.length && (r || "boolean" != typeof i),
                    s = r || (i === !0 || o === !0 ? "margin" : "border");
                return x.access(this, function(n, r, i) {
                    var o;
                    return x.isWindow(n) ? n.document.documentElement["client" + e] : 9 === n.nodeType ? (o = n.documentElement, Math.max(n.body["scroll" + e], o["scroll" + e], n.body["offset" + e], o["offset" + e], o["client" + e])) : i === t ? x.css(n, r, s) : x.style(n, r, i, s)
                }, n, a ? i : t, a, null)
            }
        })
    }), x.fn.size = function() {
        return this.length
    }, x.fn.andSelf = x.fn.addBack, "object" == typeof module && module && "object" == typeof module.exports ? module.exports = x : (e.jQuery = e.$ = x, "function" == typeof define && define.amd && define("jquery", [], function() {
        return x
    }))
})(window);;/*! Magnific Popup - v0.9.2 - 2013-07-15
 * http://dimsemenov.com/plugins/magnific-popup/
 * Copyright (c) 2013 Dmitry Semenov; */
;
(function($) {

    /*>>core*/
    /**
     *
     * Magnific Popup Core JS file
     *
     */


    /**
     * Private static constants
     */
    var CLOSE_EVENT = 'Close',
        BEFORE_CLOSE_EVENT = 'BeforeClose',
        AFTER_CLOSE_EVENT = 'AfterClose',
        BEFORE_APPEND_EVENT = 'BeforeAppend',
        MARKUP_PARSE_EVENT = 'MarkupParse',
        OPEN_EVENT = 'Open',
        CHANGE_EVENT = 'Change',
        NS = 'mfp',
        EVENT_NS = '.' + NS,
        READY_CLASS = 'mfp-ready',
        REMOVING_CLASS = 'mfp-removing',
        PREVENT_CLOSE_CLASS = 'mfp-prevent-close';


    /**
     * Private vars
     */
    var mfp, // As we have only one instance of MagnificPopup object, we define it locally to not to use 'this'
        MagnificPopup = function() {},
        _isJQ = !! (window.jQuery),
        _prevStatus,
        _window = $(window),
        _body,
        _document,
        _prevContentType,
        _wrapClasses,
        _currPopupType;


    /**
     * Private functions
     */
    var _mfpOn = function(name, f) {
        mfp.ev.on(NS + name + EVENT_NS, f);
    },
        _getEl = function(className, appendTo, html, raw) {
            var el = document.createElement('div');
            el.className = 'mfp-' + className;
            if (html) {
                el.innerHTML = html;
            }
            if (!raw) {
                el = $(el);
                if (appendTo) {
                    el.appendTo(appendTo);
                }
            } else if (appendTo) {
                appendTo.appendChild(el);
            }
            return el;
        },
        _mfpTrigger = function(e, data) {
            mfp.ev.triggerHandler(NS + e, data);

            if (mfp.st.callbacks) {
                // converts "mfpEventName" to "eventName" callback and triggers it if it's present
                e = e.charAt(0).toLowerCase() + e.slice(1);
                if (mfp.st.callbacks[e]) {
                    mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
                }
            }
        },
        _setFocus = function() {
            (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).trigger('focus');
        },
        _getCloseBtn = function(type) {
            if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
                mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace('%title%', mfp.st.tClose));
                _currPopupType = type;
            }
            return mfp.currTemplate.closeBtn;
        },
        // Initialize Magnific Popup only when called at least once
        _checkInstance = function() {
            if (!$.magnificPopup.instance) {
                mfp = new MagnificPopup();
                mfp.init();
                $.magnificPopup.instance = mfp;
            }
        },
        // Check to close popup or not
        // "target" is an element that was clicked
        _checkIfClose = function(target) {

            if ($(target).hasClass(PREVENT_CLOSE_CLASS)) {
                return;
            }

            var closeOnContent = mfp.st.closeOnContentClick;
            var closeOnBg = mfp.st.closeOnBgClick;

            if (closeOnContent && closeOnBg) {
                return true;
            } else {

                // We close the popup if click is on close button or on preloader. Or if there is no content.
                if (!mfp.content || $(target).hasClass('mfp-close') || (mfp.preloader && target === mfp.preloader[0])) {
                    return true;
                }

                // if click is outside the content
                if ((target !== mfp.content[0] && !$.contains(mfp.content[0], target))) {
                    if (closeOnBg) {
                        // last check, if the clicked element is in DOM, (in case it's removed onclick)
                        if ($.contains(document, target)) {
                            return true;
                        }
                    }
                } else if (closeOnContent) {
                    return true;
                }

            }
            return false;
        },
        // CSS transition detection, http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
        supportsTransitions = function() {
            var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
                v = ['ms', 'O', 'Moz', 'Webkit']; // 'v' for vendor

            if (s['transition'] !== undefined) {
                return true;
            }

            while (v.length) {
                if (v.pop() + 'Transition' in s) {
                    return true;
                }
            }

            return false;
        };



    /**
     * Public functions
     */
    MagnificPopup.prototype = {

        constructor: MagnificPopup,

        /**
         * Initializes Magnific Popup plugin.
         * This function is triggered only once when $.fn.magnificPopup or $.magnificPopup is executed
         */
        init: function() {
            var appVersion = navigator.appVersion;
            mfp.isIE7 = appVersion.indexOf("MSIE 7.") !== -1;
            mfp.isIE8 = appVersion.indexOf("MSIE 8.") !== -1;
            mfp.isLowIE = mfp.isIE7 || mfp.isIE8;
            mfp.isAndroid = (/android/gi).test(appVersion);
            mfp.isIOS = (/iphone|ipad|ipod/gi).test(appVersion);
            mfp.supportsTransition = supportsTransitions();

            // We disable fixed positioned lightbox on devices that don't handle it nicely.
            // If you know a better way of detecting this - let me know.
            mfp.probablyMobile = (mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent));
            _body = $(document.body);
            _document = $(document);

            mfp.popupsCache = {};
        },

        /**
         * Opens popup
         * @param  data [description]
         */
        open: function(data) {

            var i;

            if (data.isObj === false) {
                // convert jQuery collection to array to avoid conflicts later
                mfp.items = data.items.toArray();

                mfp.index = 0;
                var items = data.items,
                    item;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    if (item.parsed) {
                        item = item.el[0];
                    }
                    if (item === data.el[0]) {
                        mfp.index = i;
                        break;
                    }
                }
            } else {
                mfp.items = $.isArray(data.items) ? data.items : [data.items];
                mfp.index = data.index || 0;
            }

            // if popup is already opened - we just update the content
            if (mfp.isOpen) {
                mfp.updateItemHTML();
                return;
            }

            mfp.types = [];
            _wrapClasses = '';
            if (data.mainEl && data.mainEl.length) {
                mfp.ev = data.mainEl.eq(0);
            } else {
                mfp.ev = _document;
            }

            if (data.key) {
                if (!mfp.popupsCache[data.key]) {
                    mfp.popupsCache[data.key] = {};
                }
                mfp.currTemplate = mfp.popupsCache[data.key];
            } else {
                mfp.currTemplate = {};
            }



            mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
            mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

            if (mfp.st.modal) {
                mfp.st.closeOnContentClick = false;
                mfp.st.closeOnBgClick = false;
                mfp.st.showCloseBtn = false;
                mfp.st.enableEscapeKey = false;
            }


            // Building markup
            // main containers are created only once
            if (!mfp.bgOverlay) {

                // Dark overlay
                mfp.bgOverlay = _getEl('bg').on('click' + EVENT_NS, function() {
                    mfp.close();
                });

                mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click' + EVENT_NS, function(e) {
                    if (_checkIfClose(e.target)) {
                        mfp.close();
                    }
                });

                mfp.container = _getEl('container', mfp.wrap);
            }

            mfp.contentContainer = _getEl('content');
            if (mfp.st.preloader) {
                mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
            }


            // Initializing modules
            var modules = $.magnificPopup.modules;
            for (i = 0; i < modules.length; i++) {
                var n = modules[i];
                n = n.charAt(0).toUpperCase() + n.slice(1);
                mfp['init' + n].call(mfp);
            }
            _mfpTrigger('BeforeOpen');


            if (mfp.st.showCloseBtn) {
                // Close button
                if (!mfp.st.closeBtnInside) {
                    mfp.wrap.append(_getCloseBtn());
                } else {
                    _mfpOn(MARKUP_PARSE_EVENT, function(e, template, values, item) {
                        values.close_replaceWith = _getCloseBtn(item.type);
                    });
                    _wrapClasses += ' mfp-close-btn-in';
                }
            }

            if (mfp.st.alignTop) {
                _wrapClasses += ' mfp-align-top';
            }



            if (mfp.fixedContentPos) {
                mfp.wrap.css({
                    overflow: mfp.st.overflowY,
                    overflowX: 'hidden',
                    overflowY: mfp.st.overflowY
                });
            } else {
                mfp.wrap.css({
                    top: _window.scrollTop(),
                    position: 'absolute'
                });
            }
            if (mfp.st.fixedBgPos === false || (mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos)) {
                mfp.bgOverlay.css({
                    height: _document.height(),
                    position: 'absolute'
                });
            }



            if (mfp.st.enableEscapeKey) {
                // Close on ESC key
                _document.on('keyup' + EVENT_NS, function(e) {
                    if (e.keyCode === 27) {
                        mfp.close();
                    }
                });
            }

            _window.on('resize' + EVENT_NS, function() {
                mfp.updateSize();
            });


            if (!mfp.st.closeOnContentClick) {
                _wrapClasses += ' mfp-auto-cursor';
            }

            if (_wrapClasses)
                mfp.wrap.addClass(_wrapClasses);


            // this triggers recalculation of layout, so we get it once to not to trigger twice
            var windowHeight = mfp.wH = _window.height();


            var windowStyles = {};

            // if (mfp.fixedContentPos) {
            //     if (mfp._hasScrollBar(windowHeight)) {
            //         var s = mfp._getScrollbarSize();
            //         if (s) {
            //             windowStyles.paddingRight = s;
            //         }
            //     }
            // }

            // if (mfp.fixedContentPos) {
            //     if (!mfp.isIE7) {
            //         windowStyles.overflow = 'hidden';
            //     } else {
            //         // ie7 double-scroll bug
            //         $('body, html').css('overflow', 'hidden');
            //     }
            // }



            var classesToadd = mfp.st.mainClass;
            if (mfp.isIE7) {
                classesToadd += ' mfp-ie7';
            }
            if (classesToadd) {
                mfp._addClassToMFP(classesToadd);
            }

            // add content
            mfp.updateItemHTML();

            _mfpTrigger('BuildControls');


            // remove scrollbar, add padding e.t.c
            $('html').css(windowStyles);

            // add everything to DOM
            mfp.bgOverlay.add(mfp.wrap).prependTo(document.body);



            // Save last focused element
            mfp._lastFocusedEl = document.activeElement;

            // Wait for next cycle to allow CSS transition
            setTimeout(function() {

                if (mfp.content) {
                    mfp._addClassToMFP(READY_CLASS);
                    _setFocus();
                } else {
                    // if content is not defined (not loaded e.t.c) we add class only for BG
                    mfp.bgOverlay.addClass(READY_CLASS);
                }

                // Trap the focus in popup
                _document.on('focusin' + EVENT_NS, function(e) {
                    if (e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target)) {
                        _setFocus();
                        return false;
                    }
                });

            }, 16);

            mfp.isOpen = true;
            mfp.updateSize(windowHeight);
            _mfpTrigger(OPEN_EVENT);
        },

        /**
         * Closes the popup
         */
        close: function() {
            if (!mfp.isOpen) return;
            _mfpTrigger(BEFORE_CLOSE_EVENT);

            mfp.isOpen = false;
            // for CSS3 animation
            if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
                mfp._addClassToMFP(REMOVING_CLASS);
                setTimeout(function() {
                    mfp._close();
                }, mfp.st.removalDelay);
            } else {
                mfp._close();
            }
        },

        /**
         * Helper for close() function
         */
        _close: function() {
            _mfpTrigger(CLOSE_EVENT);

            var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

            mfp.bgOverlay.detach();
            mfp.wrap.detach();
            mfp.container.empty();

            if (mfp.st.mainClass) {
                classesToRemove += mfp.st.mainClass + ' ';
            }

            mfp._removeClassFromMFP(classesToRemove);

            if (mfp.fixedContentPos) {
                var windowStyles = {
                    paddingRight: ''
                };
                // if (mfp.isIE7) {
                //     $('body, html').css('overflow', '');
                // } else {
                //     windowStyles.overflow = '';
                // }
                $('html').css(windowStyles);
            }

            _document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
            mfp.ev.off(EVENT_NS);

            // clean up DOM elements that aren't removed
            mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
            mfp.bgOverlay.attr('class', 'mfp-bg');
            mfp.container.attr('class', 'mfp-container');

            // remove close button from target element
            if (mfp.st.showCloseBtn &&
                (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
                if (mfp.currTemplate.closeBtn)
                    mfp.currTemplate.closeBtn.detach();
            }


            if (mfp._lastFocusedEl) {
                $(mfp._lastFocusedEl).trigger('focus'); // put tab focus back
            }
            mfp.currItem = null;
            mfp.content = null;
            mfp.currTemplate = null;
            mfp.prevHeight = 0;

            _mfpTrigger(AFTER_CLOSE_EVENT);
        },

        updateSize: function(winHeight) {

            if (mfp.isIOS) {
                // fixes iOS nav bars https://github.com/dimsemenov/Magnific-Popup/issues/2
                var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
                var height = window.innerHeight * zoomLevel;
                mfp.wrap.css('height', height);
                mfp.wH = height;
            } else {
                mfp.wH = winHeight || _window.height();
            }
            // Fixes #84: popup incorrectly positioned with position:relative on body
            if (!mfp.fixedContentPos) {
                mfp.wrap.css('height', mfp.wH);
            }

            _mfpTrigger('Resize');

        },

        /**
         * Set content of popup based on current index
         */
        updateItemHTML: function() {
            var item = mfp.items[mfp.index];

            // Detach and perform modifications
            mfp.contentContainer.detach();

            if (mfp.content)
                mfp.content.detach();

            if (!item.parsed) {
                item = mfp.parseEl(mfp.index);
            }

            var type = item.type;

            _mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);
            // BeforeChange event works like so:
            // _mfpOn('BeforeChange', function(e, prevType, newType) { });

            mfp.currItem = item;





            if (!mfp.currTemplate[type]) {
                var markup = mfp.st[type] ? mfp.st[type].markup : false;

                // allows to modify markup
                _mfpTrigger('FirstMarkupParse', markup);

                if (markup) {
                    mfp.currTemplate[type] = $(markup);
                } else {
                    // if there is no markup found we just define that template is parsed
                    mfp.currTemplate[type] = true;
                }
            }

            if (_prevContentType && _prevContentType !== item.type) {
                mfp.container.removeClass('mfp-' + _prevContentType + '-holder');
            }

            var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
            mfp.appendContent(newContent, type);

            item.preloaded = true;

            _mfpTrigger(CHANGE_EVENT, item);
            _prevContentType = item.type;

            // Append container back after its content changed
            mfp.container.prepend(mfp.contentContainer);

            _mfpTrigger('AfterChange');
        },


        /**
         * Set HTML content of popup
         */
        appendContent: function(newContent, type) {
            mfp.content = newContent;

            if (newContent) {
                if (mfp.st.showCloseBtn && mfp.st.closeBtnInside &&
                    mfp.currTemplate[type] === true) {
                    // if there is no markup, we just append close button element inside
                    if (!mfp.content.find('.mfp-close').length) {
                        mfp.content.append(_getCloseBtn());
                    }
                } else {
                    mfp.content = newContent;
                }
            } else {
                mfp.content = '';
            }

            _mfpTrigger(BEFORE_APPEND_EVENT);
            mfp.container.addClass('mfp-' + type + '-holder');

            mfp.contentContainer.append(mfp.content);
        },




        /**
         * Creates Magnific Popup data object based on given data
         * @param  {int} index Index of item to parse
         */
        parseEl: function(index) {
            var item = mfp.items[index],
                type = item.type;

            if (item.tagName) {
                item = {
                    el: $(item)
                };
            } else {
                item = {
                    data: item,
                    src: item.src
                };
            }

            if (item.el) {
                var types = mfp.types;

                // check for 'mfp-TYPE' class
                for (var i = 0; i < types.length; i++) {
                    if (item.el.hasClass('mfp-' + types[i])) {
                        type = types[i];
                        break;
                    }
                }

                item.src = item.el.attr('data-mfp-src');
                if (!item.src) {
                    item.src = item.el.attr('href');
                }
            }

            item.type = type || mfp.st.type || 'inline';
            item.index = index;
            item.parsed = true;
            mfp.items[index] = item;
            _mfpTrigger('ElementParse', item);

            return mfp.items[index];
        },


        /**
         * Initializes single popup or a group of popups
         */
        addGroup: function(el, options) {
            var eHandler = function(e) {
                e.mfpEl = this;
                mfp._openClick(e, el, options);
            };

            if (!options) {
                options = {};
            }

            var eName = 'click.magnificPopup';
            options.mainEl = el;

            if (options.items) {
                options.isObj = true;
                el.off(eName).on(eName, eHandler);
            } else {
                options.isObj = false;
                if (options.delegate) {
                    el.off(eName).on(eName, options.delegate, eHandler);
                } else {
                    options.items = el;
                    el.off(eName).on(eName, eHandler);
                }
            }
        },
        _openClick: function(e, el, options) {
            var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;


            if (!midClick && (e.which === 2 || e.ctrlKey || e.metaKey)) {
                return;
            }

            var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

            if (disableOn) {
                if ($.isFunction(disableOn)) {
                    if (!disableOn.call(mfp)) {
                        return true;
                    }
                } else { // else it's number
                    if (_window.width() < disableOn) {
                        return true;
                    }
                }
            }

            if (e.type) {
                e.preventDefault();

                // This will prevent popup from closing if element is inside and popup is already opened
                if (mfp.isOpen) {
                    e.stopPropagation();
                }
            }


            options.el = $(e.mfpEl);
            if (options.delegate) {
                options.items = el.find(options.delegate);
            }
            mfp.open(options);
        },


        /**
         * Updates text on preloader
         */
        updateStatus: function(status, text) {

            if (mfp.preloader) {
                if (_prevStatus !== status) {
                    mfp.container.removeClass('mfp-s-' + _prevStatus);
                }

                if (!text && status === 'loading') {
                    text = mfp.st.tLoading;
                }

                var data = {
                    status: status,
                    text: text
                };
                // allows to modify status
                _mfpTrigger('UpdateStatus', data);

                status = data.status;
                text = data.text;

                mfp.preloader.html(text);

                mfp.preloader.find('a').on('click', function(e) {
                    e.stopImmediatePropagation();
                });

                mfp.container.addClass('mfp-s-' + status);
                _prevStatus = status;
            }
        },


        /*
		"Private" helpers that aren't private at all
	 */
        _addClassToMFP: function(cName) {
            mfp.bgOverlay.addClass(cName);
            mfp.wrap.addClass(cName);
        },
        _removeClassFromMFP: function(cName) {
            this.bgOverlay.removeClass(cName);
            mfp.wrap.removeClass(cName);
        },
        _hasScrollBar: function(winHeight) {
            return ((mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height()));
        },
        _parseMarkup: function(template, values, item) {
            var arr;
            if (item.data) {
                values = $.extend(item.data, values);
            }
            _mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item]);

            $.each(values, function(key, value) {
                if (value === undefined || value === false) {
                    return true;
                }
                arr = key.split('_');
                if (arr.length > 1) {
                    var el = template.find(EVENT_NS + '-' + arr[0]);

                    if (el.length > 0) {
                        var attr = arr[1];
                        if (attr === 'replaceWith') {
                            if (el[0] !== value[0]) {
                                el.replaceWith(value);
                            }
                        } else if (attr === 'img') {
                            if (el.is('img')) {
                                el.attr('src', value);
                            } else {
                                el.replaceWith('<img src="' + value + '" class="' + el.attr('class') + '" />');
                            }
                        } else {
                            el.attr(arr[1], value);
                        }
                    }

                } else {
                    template.find(EVENT_NS + '-' + key).html(value);
                }
            });
        },

        _getScrollbarSize: function() {
            // thx David
            if (mfp.scrollbarSize === undefined) {
                var scrollDiv = document.createElement("div");
                scrollDiv.id = "mfp-sbm";
                scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
                document.body.appendChild(scrollDiv);
                mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv);
            }
            return mfp.scrollbarSize;
        }

    }; /* MagnificPopup core prototype end */




    /**
     * Public static functions
     */
    $.magnificPopup = {
        instance: null,
        proto: MagnificPopup.prototype,
        modules: [],

        open: function(options, index) {
            _checkInstance();

            if (!options)
                options = {};

            options.isObj = true;
            options.index = index || 0;
            return this.instance.open(options);
        },

        close: function() {
            return $.magnificPopup.instance.close();
        },

        registerModule: function(name, module) {
            if (module.options) {
                $.magnificPopup.defaults[name] = module.options;
            }
            $.extend(this.proto, module.proto);
            this.modules.push(name);
        },

        defaults: {

            // Info about options is in docs:
            // http://dimsemenov.com/plugins/magnific-popup/documentation.html#options

            disableOn: 0,

            key: null,

            midClick: true,

            mainClass: '',

            preloader: true,

            focus: '', // CSS selector of input to focus after popup is opened

            closeOnContentClick: false,

            closeOnBgClick: true,

            closeBtnInside: false,

            showCloseBtn: true,

            enableEscapeKey: true,

            modal: false,

            alignTop: false,

            removalDelay: 300,

            fixedContentPos: 'auto',

            fixedBgPos: 'auto',

            overflowY: 'auto',

            closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',

            tClose: 'Close (Esc)',

            tLoading: 'Loading...',

            callbacks: {
                beforeOpen: function() {
                    this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                    this.st.mainClass = this.st.el.attr('data-effect');
                }
            }

        }
    };



    $.fn.magnificPopup = function(options) {
        _checkInstance();

        var jqEl = $(this);

        // We call some API method of first param is a string
        if (typeof options === "string") {

            if (options === 'open') {
                var items,
                    itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
                    index = parseInt(arguments[1], 10) || 0;

                if (itemOpts.items) {
                    items = itemOpts.items[index];
                } else {
                    items = jqEl;
                    if (itemOpts.delegate) {
                        items = items.find(itemOpts.delegate);
                    }
                    items = items.eq(index);
                }
                mfp._openClick({
                    mfpEl: items
                }, jqEl, itemOpts);
            } else {
                if (mfp.isOpen)
                    mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
            }

        } else {

            /*
             * As Zepto doesn't support .data() method for objects
             * and it works only in normal browsers
             * we assign "options" object directly to the DOM element. FTW!
             */
            if (_isJQ) {
                jqEl.data('magnificPopup', options);
            } else {
                jqEl[0].magnificPopup = options;
            }

            mfp.addGroup(jqEl, options);

        }
        return jqEl;
    };


    //Quick benchmark
    /*
var start = performance.now(),
	i,
	rounds = 1000;

for(i = 0; i < rounds; i++) {

}
console.log('Test #1:', performance.now() - start);

start = performance.now();
for(i = 0; i < rounds; i++) {

}
console.log('Test #2:', performance.now() - start);
*/


    /*>>core*/

    /*>>inline*/

    var INLINE_NS = 'inline',
        _hiddenClass,
        _inlinePlaceholder,
        _lastInlineElement,
        _putInlineElementsBack = function() {
            if (_lastInlineElement) {
                _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
                _lastInlineElement = null;
            }
        };

    $.magnificPopup.registerModule(INLINE_NS, {
        options: {
            hiddenClass: 'hide', // will be appended with `mfp-` prefix
            markup: '',
            tNotFound: 'Content not found'
        },
        proto: {

            initInline: function() {
                mfp.types.push(INLINE_NS);

                _mfpOn(CLOSE_EVENT + '.' + INLINE_NS, function() {
                    _putInlineElementsBack();
                });
            },

            getInline: function(item, template) {

                _putInlineElementsBack();

                if (item.src) {
                    var inlineSt = mfp.st.inline,
                        el = $(item.src);

                    if (el.length) {

                        // If target element has parent - we replace it with placeholder and put it back after popup is closed
                        var parent = el[0].parentNode;
                        if (parent && parent.tagName) {
                            if (!_inlinePlaceholder) {
                                _hiddenClass = inlineSt.hiddenClass;
                                _inlinePlaceholder = _getEl(_hiddenClass);
                                _hiddenClass = 'mfp-' + _hiddenClass;
                            }
                            // replace target inline element with placeholder
                            _lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
                        }

                        mfp.updateStatus('ready');
                    } else {
                        mfp.updateStatus('error', inlineSt.tNotFound);
                        el = $('<div>');
                    }

                    item.inlineElement = el;
                    return el;
                }

                mfp.updateStatus('ready');
                mfp._parseMarkup(template, {}, item);
                return template;
            }
        }
    });

    /*>>inline*/

    /*>>ajax*/
    var AJAX_NS = 'ajax',
        _ajaxCur,
        _removeAjaxCursor = function() {
            if (_ajaxCur) {
                _body.removeClass(_ajaxCur);
            }
        };

    $.magnificPopup.registerModule(AJAX_NS, {

        options: {
            settings: null,
            cursor: 'mfp-ajax-cur',
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },

        proto: {
            initAjax: function() {
                mfp.types.push(AJAX_NS);
                _ajaxCur = mfp.st.ajax.cursor;

                _mfpOn(CLOSE_EVENT + '.' + AJAX_NS, function() {
                    _removeAjaxCursor();
                    if (mfp.req) {
                        mfp.req.abort();
                    }
                });
            },

            getAjax: function(item) {

                if (_ajaxCur)
                    _body.addClass(_ajaxCur);

                mfp.updateStatus('loading');

                var opts = $.extend({
                    url: item.src,
                    success: function(data, textStatus, jqXHR) {
                        var temp = {
                            data: data,
                            xhr: jqXHR
                        };

                        _mfpTrigger('ParseAjax', temp);

                        mfp.appendContent($(temp.data), AJAX_NS);

                        item.finished = true;

                        _removeAjaxCursor();

                        _setFocus();

                        setTimeout(function() {
                            mfp.wrap.addClass(READY_CLASS);
                        }, 16);

                        mfp.updateStatus('ready');

                        _mfpTrigger('AjaxContentAdded');
                    },
                    error: function() {
                        _removeAjaxCursor();
                        item.finished = item.loadError = true;
                        mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
                    }
                }, mfp.st.ajax.settings);

                mfp.req = $.ajax(opts);

                return '';
            }
        }
    });







    /*>>ajax*/

    /*>>image*/
    var _imgInterval,
        _getTitle = function(item) {
            if (item.data && item.data.title !== undefined)
                return item.data.title;

            var src = mfp.st.image.titleSrc;

            if (src) {
                if ($.isFunction(src)) {
                    return src.call(mfp, item);
                } else if (item.el) {
                    return item.el.attr(src) || '';
                }
            }
            return '';
        };

    $.magnificPopup.registerModule('image', {

        options: {
            markup: '<div class="mfp-figure">' +
                '<div class="mfp-close"></div>' +
                '<div class="mfp-img"></div>' +
                '<div class="mfp-bottom-bar">' +
                '<div class="mfp-title"></div>' +
                '<div class="mfp-counter"></div>' +
                '</div>' +
                '</div>',
            cursor: 'mfp-zoom-out-cur',
            titleSrc: 'title',
            verticalFit: true,
            tError: '<a href="%url%">The image</a> could not be loaded.'
        },

        proto: {
            initImage: function() {
                var imgSt = mfp.st.image,
                    ns = '.image';

                mfp.types.push('image');

                _mfpOn(OPEN_EVENT + ns, function() {
                    if (mfp.currItem.type === 'image' && imgSt.cursor) {
                        _body.addClass(imgSt.cursor);
                    }
                });

                _mfpOn(CLOSE_EVENT + ns, function() {
                    if (imgSt.cursor) {
                        _body.removeClass(imgSt.cursor);
                    }
                    _window.off('resize' + EVENT_NS);
                });

                _mfpOn('Resize' + ns, mfp.resizeImage);
                if (mfp.isLowIE) {
                    _mfpOn('AfterChange', mfp.resizeImage);
                }
            },
            resizeImage: function() {
                var item = mfp.currItem;
                if (!item.img) return;

                if (mfp.st.image.verticalFit) {
                    var decr = 0;
                    // fix box-sizing in ie7/8
                    if (mfp.isLowIE) {
                        decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'), 10);
                    }
                    item.img.css('max-height', mfp.wH - decr);
                }
            },
            _onImageHasSize: function(item) {
                if (item.img) {

                    item.hasSize = true;

                    if (_imgInterval) {
                        clearInterval(_imgInterval);
                    }

                    item.isCheckingImgSize = false;

                    _mfpTrigger('ImageHasSize', item);

                    if (item.imgHidden) {
                        if (mfp.content)
                            mfp.content.removeClass('mfp-loading');

                        item.imgHidden = false;
                    }

                }
            },

            /**
             * Function that loops until the image has size to display elements that rely on it asap
             */
            findImageSize: function(item) {

                var counter = 0,
                    img = item.img[0],
                    mfpSetInterval = function(delay) {

                        if (_imgInterval) {
                            clearInterval(_imgInterval);
                        }
                        // decelerating interval that checks for size of an image
                        _imgInterval = setInterval(function() {
                            if (img.naturalWidth > 0) {
                                mfp._onImageHasSize(item);
                                return;
                            }

                            if (counter > 200) {
                                clearInterval(_imgInterval);
                            }

                            counter++;
                            if (counter === 3) {
                                mfpSetInterval(10);
                            } else if (counter === 40) {
                                mfpSetInterval(50);
                            } else if (counter === 100) {
                                mfpSetInterval(500);
                            }
                        }, delay);
                    };

                mfpSetInterval(1);
            },

            getImage: function(item, template) {

                var guard = 0,

                    // image load complete handler
                    onLoadComplete = function() {
                        if (item) {
                            if (item.img[0].complete) {
                                item.img.off('.mfploader');

                                if (item === mfp.currItem) {
                                    mfp._onImageHasSize(item);

                                    mfp.updateStatus('ready');
                                }

                                item.hasSize = true;
                                item.loaded = true;

                                _mfpTrigger('ImageLoadComplete');

                            } else {
                                // if image complete check fails 200 times (20 sec), we assume that there was an error.
                                guard++;
                                if (guard < 200) {
                                    setTimeout(onLoadComplete, 100);
                                } else {
                                    onLoadError();
                                }
                            }
                        }
                    },

                    // image error handler
                    onLoadError = function() {
                        if (item) {
                            item.img.off('.mfploader');
                            if (item === mfp.currItem) {
                                mfp._onImageHasSize(item);
                                mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
                            }

                            item.hasSize = true;
                            item.loaded = true;
                            item.loadError = true;
                        }
                    },
                    imgSt = mfp.st.image;


                var el = template.find('.mfp-img');
                if (el.length) {
                    var img = new Image();
                    img.className = 'mfp-img';
                    item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
                    img.src = item.src;

                    // without clone() "error" event is not firing when IMG is replaced by new IMG
                    // TODO: find a way to avoid such cloning
                    if (el.is('img')) {
                        item.img = item.img.clone();
                    }
                    if (item.img[0].naturalWidth > 0) {
                        item.hasSize = true;
                    }
                }

                mfp._parseMarkup(template, {
                    title: _getTitle(item),
                    img_replaceWith: item.img
                }, item);

                mfp.resizeImage();

                if (item.hasSize) {
                    if (_imgInterval) clearInterval(_imgInterval);

                    if (item.loadError) {
                        template.addClass('mfp-loading');
                        mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
                    } else {
                        template.removeClass('mfp-loading');
                        mfp.updateStatus('ready');
                    }
                    return template;
                }

                mfp.updateStatus('loading');
                item.loading = true;

                if (!item.hasSize) {
                    item.imgHidden = true;
                    template.addClass('mfp-loading');
                    mfp.findImageSize(item);
                }

                return template;
            }
        }
    });



    /*>>image*/

    /*>>zoom*/
    var hasMozTransform,
        getHasMozTransform = function() {
            if (hasMozTransform === undefined) {
                hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
            }
            return hasMozTransform;
        };

    $.magnificPopup.registerModule('zoom', {

        options: {
            enabled: false,
            easing: 'ease-in-out',
            duration: 300,
            opener: function(element) {
                return element.is('img') ? element : element.find('img');
            }
        },

        proto: {

            initZoom: function() {
                var zoomSt = mfp.st.zoom,
                    ns = '.zoom';

                if (!zoomSt.enabled || !mfp.supportsTransition) {
                    return;
                }

                var duration = zoomSt.duration,
                    getElToAnimate = function(image) {
                        var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
                            transition = 'all ' + (zoomSt.duration / 1000) + 's ' + zoomSt.easing,
                            cssObj = {
                                position: 'fixed',
                                zIndex: 9999,
                                left: 0,
                                top: 0,
                                '-webkit-backface-visibility': 'hidden'
                            },
                            t = 'transition';

                        cssObj['-webkit-' + t] = cssObj['-moz-' + t] = cssObj['-o-' + t] = cssObj[t] = transition;

                        newImg.css(cssObj);
                        return newImg;
                    },
                    showMainContent = function() {
                        mfp.content.css('visibility', 'visible');
                    },
                    openTimeout,
                    animatedImg;

                _mfpOn('BuildControls' + ns, function() {
                    if (mfp._allowZoom()) {

                        clearTimeout(openTimeout);
                        mfp.content.css('visibility', 'hidden');

                        // Basically, all code below does is clones existing image, puts in on top of the current one and animated it

                        image = mfp._getItemToZoom();

                        if (!image) {
                            showMainContent();
                            return;
                        }

                        animatedImg = getElToAnimate(image);

                        animatedImg.css(mfp._getOffset());

                        mfp.wrap.append(animatedImg);

                        openTimeout = setTimeout(function() {
                            animatedImg.css(mfp._getOffset(true));
                            openTimeout = setTimeout(function() {

                                showMainContent();

                                setTimeout(function() {
                                    animatedImg.remove();
                                    image = animatedImg = null;
                                    _mfpTrigger('ZoomAnimationEnded');
                                }, 16); // avoid blink when switching images 

                            }, duration); // this timeout equals animation duration

                        }, 16); // by adding this timeout we avoid short glitch at the beginning of animation


                        // Lots of timeouts...
                    }
                });
                _mfpOn(BEFORE_CLOSE_EVENT + ns, function() {
                    if (mfp._allowZoom()) {

                        clearTimeout(openTimeout);

                        mfp.st.removalDelay = duration;

                        if (!image) {
                            image = mfp._getItemToZoom();
                            if (!image) {
                                return;
                            }
                            animatedImg = getElToAnimate(image);
                        }


                        animatedImg.css(mfp._getOffset(true));
                        mfp.wrap.append(animatedImg);
                        mfp.content.css('visibility', 'hidden');

                        setTimeout(function() {
                            animatedImg.css(mfp._getOffset());
                        }, 16);
                    }

                });

                _mfpOn(CLOSE_EVENT + ns, function() {
                    if (mfp._allowZoom()) {
                        showMainContent();
                        if (animatedImg) {
                            animatedImg.remove();
                        }
                    }
                });
            },

            _allowZoom: function() {
                return mfp.currItem.type === 'image';
            },

            _getItemToZoom: function() {
                if (mfp.currItem.hasSize) {
                    return mfp.currItem.img;
                } else {
                    return false;
                }
            },

            // Get element postion relative to viewport
            _getOffset: function(isLarge) {
                var el;
                if (isLarge) {
                    el = mfp.currItem.img;
                } else {
                    el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
                }

                var offset = el.offset();
                var paddingTop = parseInt(el.css('padding-top'), 10);
                var paddingBottom = parseInt(el.css('padding-bottom'), 10);
                offset.top -= ($(window).scrollTop() - paddingTop);


                /*
			
			Animating left + top + width/height looks glitchy in Firefox, but perfect in Chrome. And vice-versa.

			 */
                var obj = {
                    width: el.width(),
                    // fix Zepto height+padding issue
                    height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
                };

                // I hate to do this, but there is no another option
                if (getHasMozTransform()) {
                    obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
                } else {
                    obj.left = offset.left;
                    obj.top = offset.top;
                }
                return obj;
            }

        }
    });



    /*>>zoom*/

    /*>>iframe*/

    var IFRAME_NS = 'iframe',
        _emptyPage = '//about:blank',

        _fixIframeBugs = function(isShowing) {
            if (mfp.currTemplate[IFRAME_NS]) {
                var el = mfp.currTemplate[IFRAME_NS].find('iframe');
                if (el.length) {
                    // reset src after the popup is closed to avoid "video keeps playing after popup is closed" bug
                    if (!isShowing) {
                        el[0].src = _emptyPage;
                    }

                    // IE8 black screen bug fix
                    if (mfp.isIE8) {
                        el.css('display', isShowing ? 'block' : 'none');
                    }
                }
            }
        };

    $.magnificPopup.registerModule(IFRAME_NS, {

        options: {
            markup: '<div class="mfp-iframe-scaler">' +
                '<div class="mfp-close"></div>' +
                '<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>' +
                '</div>',

            srcAction: 'iframe_src',

            // we don't care and support only one default type of URL by default
            patterns: {
                youtube: {
                    index: 'youtube.com',
                    id: 'v=',
                    src: '//www.youtube.com/embed/%id%?autoplay=1'
                },
                vimeo: {
                    index: 'vimeo.com/',
                    id: '/',
                    src: '//player.vimeo.com/video/%id%?autoplay=1'
                },
                gmaps: {
                    index: '//maps.google.',
                    src: '%id%&output=embed'
                }
            }
        },

        proto: {
            initIframe: function() {
                mfp.types.push(IFRAME_NS);

                _mfpOn('BeforeChange', function(e, prevType, newType) {
                    if (prevType !== newType) {
                        if (prevType === IFRAME_NS) {
                            _fixIframeBugs(); // iframe if removed
                        } else if (newType === IFRAME_NS) {
                            _fixIframeBugs(true); // iframe is showing
                        }
                    } // else {
                    // iframe source is switched, don't do anything
                    //}
                });

                _mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function() {
                    _fixIframeBugs();
                });
            },

            getIframe: function(item, template) {
                var embedSrc = item.src;
                var iframeSt = mfp.st.iframe;

                $.each(iframeSt.patterns, function() {
                    if (embedSrc.indexOf(this.index) > -1) {
                        if (this.id) {
                            if (typeof this.id === 'string') {
                                embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id) + this.id.length, embedSrc.length);
                            } else {
                                embedSrc = this.id.call(this, embedSrc);
                            }
                        }
                        embedSrc = this.src.replace('%id%', embedSrc);
                        return false; // break;
                    }
                });

                var dataObj = {};
                if (iframeSt.srcAction) {
                    dataObj[iframeSt.srcAction] = embedSrc;
                }
                mfp._parseMarkup(template, dataObj, item);

                mfp.updateStatus('ready');

                return template;
            }
        }
    });



    /*>>iframe*/

    /*>>gallery*/
    /**
     * Get looped index depending on number of slides
     */
    var _getLoopedId = function(index) {
        var numSlides = mfp.items.length;
        if (index > numSlides - 1) {
            return index - numSlides;
        } else if (index < 0) {
            return numSlides + index;
        }
        return index;
    },
        _replaceCurrTotal = function(text, curr, total) {
            return text.replace('%curr%', curr + 1).replace('%total%', total);
        };

    $.magnificPopup.registerModule('gallery', {

        options: {
            enabled: false,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
            preload: [0, 2],
            navigateByImgClick: true,
            arrows: true,

            tPrev: 'Previous (Left arrow key)',
            tNext: 'Next (Right arrow key)',
            tCounter: '%curr% of %total%'
        },

        proto: {
            initGallery: function() {

                var gSt = mfp.st.gallery,
                    ns = '.mfp-gallery',
                    supportsFastClick = Boolean($.fn.mfpFastClick);

                mfp.direction = true; // true - next, false - prev

                if (!gSt || !gSt.enabled) return false;

                _wrapClasses += ' mfp-gallery';

                _mfpOn(OPEN_EVENT + ns, function() {

                    if (gSt.navigateByImgClick) {
                        mfp.wrap.on('click' + ns, '.mfp-img', function() {
                            if (mfp.items.length > 1) {
                                mfp.next();
                                return false;
                            }
                        });
                    }

                    _document.on('keydown' + ns, function(e) {
                        if (e.keyCode === 37) {
                            mfp.prev();
                        } else if (e.keyCode === 39) {
                            mfp.next();
                        }
                    });
                });

                _mfpOn('UpdateStatus' + ns, function(e, data) {
                    if (data.text) {
                        data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
                    }
                });

                _mfpOn(MARKUP_PARSE_EVENT + ns, function(e, element, values, item) {
                    var l = mfp.items.length;
                    values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
                });

                _mfpOn('BuildControls' + ns, function() {
                    if (mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
                        var markup = gSt.arrowMarkup,
                            arrowLeft = mfp.arrowLeft = $(markup.replace('%title%', gSt.tPrev).replace('%dir%', 'left')).addClass(PREVENT_CLOSE_CLASS),
                            arrowRight = mfp.arrowRight = $(markup.replace('%title%', gSt.tNext).replace('%dir%', 'right')).addClass(PREVENT_CLOSE_CLASS);

                        var eName = supportsFastClick ? 'mfpFastClick' : 'click';
                        arrowLeft[eName](function() {
                            mfp.prev();
                        });
                        arrowRight[eName](function() {
                            mfp.next();
                        });

                        // Polyfill for :before and :after (adds elements with classes mfp-a and mfp-b)
                        if (mfp.isIE7) {
                            _getEl('b', arrowLeft[0], false, true);
                            _getEl('a', arrowLeft[0], false, true);
                            _getEl('b', arrowRight[0], false, true);
                            _getEl('a', arrowRight[0], false, true);
                        }

                        mfp.container.append(arrowLeft.add(arrowRight));
                    }
                });

                _mfpOn(CHANGE_EVENT + ns, function() {
                    if (mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

                    mfp._preloadTimeout = setTimeout(function() {
                        mfp.preloadNearbyImages();
                        mfp._preloadTimeout = null;
                    }, 16);
                });


                _mfpOn(CLOSE_EVENT + ns, function() {
                    _document.off(ns);
                    mfp.wrap.off('click' + ns);

                    if (mfp.arrowLeft && supportsFastClick) {
                        mfp.arrowLeft.add(mfp.arrowRight).destroyMfpFastClick();
                    }
                    mfp.arrowRight = mfp.arrowLeft = null;
                });

            },
            next: function() {
                mfp.direction = true;
                mfp.index = _getLoopedId(mfp.index + 1);
                mfp.updateItemHTML();
            },
            prev: function() {
                mfp.direction = false;
                mfp.index = _getLoopedId(mfp.index - 1);
                mfp.updateItemHTML();
            },
            goTo: function(newIndex) {
                mfp.direction = (newIndex >= mfp.index);
                mfp.index = newIndex;
                mfp.updateItemHTML();
            },
            preloadNearbyImages: function() {
                var p = mfp.st.gallery.preload,
                    preloadBefore = Math.min(p[0], mfp.items.length),
                    preloadAfter = Math.min(p[1], mfp.items.length),
                    i;

                for (i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
                    mfp._preloadItem(mfp.index + i);
                }
                for (i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
                    mfp._preloadItem(mfp.index - i);
                }
            },
            _preloadItem: function(index) {
                index = _getLoopedId(index);

                if (mfp.items[index].preloaded) {
                    return;
                }

                var item = mfp.items[index];
                if (!item.parsed) {
                    item = mfp.parseEl(index);
                }

                _mfpTrigger('LazyLoad', item);

                if (item.type === 'image') {
                    item.img = $('<img class="mfp-img" />').on('load.mfploader', function() {
                        item.hasSize = true;
                    }).on('error.mfploader', function() {
                        item.hasSize = true;
                        item.loadError = true;
                    }).attr('src', item.src);
                }


                item.preloaded = true;
            }
        }
    });

    /*
Touch Support that might be implemented some day

addSwipeGesture: function() {
	var startX,
		moved,
		multipleTouches;

		return;

	var namespace = '.mfp',
		addEventNames = function(pref, down, move, up, cancel) {
			mfp._tStart = pref + down + namespace;
			mfp._tMove = pref + move + namespace;
			mfp._tEnd = pref + up + namespace;
			mfp._tCancel = pref + cancel + namespace;
		};

	if(window.navigator.msPointerEnabled) {
		addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
	} else if('ontouchstart' in window) {
		addEventNames('touch', 'start', 'move', 'end', 'cancel');
	} else {
		return;
	}
	_window.on(mfp._tStart, function(e) {
		var oE = e.originalEvent;
		multipleTouches = moved = false;
		startX = oE.pageX || oE.changedTouches[0].pageX;
	}).on(mfp._tMove, function(e) {
		if(e.originalEvent.touches.length > 1) {
			multipleTouches = e.originalEvent.touches.length;
		} else {
			//e.preventDefault();
			moved = true;
		}
	}).on(mfp._tEnd + ' ' + mfp._tCancel, function(e) {
		if(moved && !multipleTouches) {
			var oE = e.originalEvent,
				diff = startX - (oE.pageX || oE.changedTouches[0].pageX);

			if(diff > 20) {
				mfp.next();
			} else if(diff < -20) {
				mfp.prev();
			}
		}
	});
},
*/


    /*>>gallery*/

    /*>>retina*/

    var RETINA_NS = 'retina';

    $.magnificPopup.registerModule(RETINA_NS, {
        options: {
            replaceSrc: function(item) {
                return item.src.replace(/\.\w+$/, function(m) {
                    return '@2x' + m;
                });
            },
            ratio: 1 // Function or number.  Set to 1 to disable.
        },
        proto: {
            initRetina: function() {
                if (window.devicePixelRatio > 1) {

                    var st = mfp.st.retina,
                        ratio = st.ratio;

                    ratio = !isNaN(ratio) ? ratio : ratio();

                    if (ratio > 1) {
                        _mfpOn('ImageHasSize' + '.' + RETINA_NS, function(e, item) {
                            item.img.css({
                                'max-width': item.img[0].naturalWidth / ratio,
                                'width': '100%'
                            });
                        });
                        _mfpOn('ElementParse' + '.' + RETINA_NS, function(e, item) {
                            item.src = st.replaceSrc(item, ratio);
                        });
                    }
                }

            }
        }
    });

    /*>>retina*/

    /*>>fastclick*/
    /**
     * FastClick event implementation. (removes 300ms delay on touch devices)
     * Based on https://developers.google.com/mobile/articles/fast_buttons
     *
     * You may use it outside the Magnific Popup by calling just:
     *
     * $('.your-el').mfpFastClick(function() {
     *     console.log('Clicked!');
     * });
     *
     * To unbind:
     * $('.your-el').destroyMfpFastClick();
     *
     *
     * Note that it's a very basic and simple implementation, it blocks ghost click on the same element where it was bound.
     * If you need something more advanced, use plugin by FT Labs https://github.com/ftlabs/fastclick
     *
     */

    (function() {
        var ghostClickDelay = 1000,
            supportsTouch = 'ontouchstart' in window,
            unbindTouchMove = function() {
                _window.off('touchmove' + ns + ' touchend' + ns);
            },
            eName = 'mfpFastClick',
            ns = '.' + eName;


        // As Zepto.js doesn't have an easy way to add custom events (like jQuery), so we implement it in this way
        $.fn.mfpFastClick = function(callback) {

            return $(this).each(function() {

                var elem = $(this),
                    lock;

                if (supportsTouch) {

                    var timeout,
                        startX,
                        startY,
                        pointerMoved,
                        point,
                        numPointers;

                    elem.on('touchstart' + ns, function(e) {
                        pointerMoved = false;
                        numPointers = 1;

                        point = e.originalEvent ? e.originalEvent.touches[0] : e.touches[0];
                        startX = point.clientX;
                        startY = point.clientY;

                        _window.on('touchmove' + ns, function(e) {
                            point = e.originalEvent ? e.originalEvent.touches : e.touches;
                            numPointers = point.length;
                            point = point[0];
                            if (Math.abs(point.clientX - startX) > 10 ||
                                Math.abs(point.clientY - startY) > 10) {
                                pointerMoved = true;
                                unbindTouchMove();
                            }
                        }).on('touchend' + ns, function(e) {
                            unbindTouchMove();
                            if (pointerMoved || numPointers > 1) {
                                return;
                            }
                            lock = true;
                            e.preventDefault();
                            clearTimeout(timeout);
                            timeout = setTimeout(function() {
                                lock = false;
                            }, ghostClickDelay);
                            callback();
                        });
                    });

                }

                elem.on('click' + ns, function() {
                    if (!lock) {
                        callback();
                    }
                });
            });
        };

        $.fn.destroyMfpFastClick = function() {
            $(this).off('touchstart' + ns + ' click' + ns);
            if (supportsTouch) _window.off('touchmove' + ns + ' touchend' + ns);
        };
    })();

    /*>>fastclick*/
})(window.jQuery || window.Zepto);;/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-backgroundsize-csstransforms3d-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;
window.Modernizr = function(a, b, c) {  
    function z(a) {
        j.cssText = a
    }

    function A(a, b) {
        return z(m.join(a + ";") + (b || ""))
    }

    function B(a, b) {
        return typeof a === b
    }

    function C(a, b) {
        return !!~("" + a).indexOf(b)
    }

    function D(a, b) {
        for (var d in a) {
            var e = a[d];
            if (!C(e, "-") && j[e] !== c) return b == "pfx" ? e : !0
        }
        return !1
    }

    function E(a, b, d) {
        for (var e in a) {
            var f = b[a[e]];
            if (f !== c) return d === !1 ? a[e] : B(f, "function") ? f.bind(d || b) : f
        }
        return !1
    }

    function F(a, b, c) {
        var d = a.charAt(0).toUpperCase() + a.slice(1),
            e = (a + " " + o.join(d + " ") + d).split(" ");
        return B(b, "string") || B(b, "undefined") ? D(e, b) : (e = (a + " " + p.join(d + " ") + d).split(" "), E(e, b, c))
    }
    var d = "2.6.2",
        e = {},
        f = !0,
        g = b.documentElement,
        h = "modernizr",
        i = b.createElement(h),
        j = i.style,
        k, l = {}.toString,
        m = " -webkit- -moz- -o- -ms- ".split(" "),
        n = "Webkit Moz O ms",
        o = n.split(" "),
        p = n.toLowerCase().split(" "),
        q = {},
        r = {},
        s = {},
        t = [],
        u = t.slice,
        v, w = function(a, c, d, e) {
            var f, i, j, k, l = b.createElement("div"),
                m = b.body,
                n = m || b.createElement("body");
            if (parseInt(d, 10))
                while (d--) j = b.createElement("div"), j.id = e ? e[d] : h + (d + 1), l.appendChild(j);
            return f = ["&#173;", '<style id="s', h, '">', a, "</style>"].join(""), l.id = h, (m ? l : n).innerHTML += f, n.appendChild(l), m || (n.style.background = "", n.style.overflow = "hidden", k = g.style.overflow, g.style.overflow = "hidden", g.appendChild(n)), i = c(l, a), m ? l.parentNode.removeChild(l) : (n.parentNode.removeChild(n), g.style.overflow = k), !!i
        },
        x = {}.hasOwnProperty,
        y;
    !B(x, "undefined") && !B(x.call, "undefined") ? y = function(a, b) {
        return x.call(a, b)
    } : y = function(a, b) {
        return b in a && B(a.constructor.prototype[b], "undefined")
    }, Function.prototype.bind || (Function.prototype.bind = function(b) {
        var c = this;
        if (typeof c != "function") throw new TypeError;
        var d = u.call(arguments, 1),
            e = function() {
                if (this instanceof e) {
                    var a = function() {};
                    a.prototype = c.prototype;
                    var f = new a,
                        g = c.apply(f, d.concat(u.call(arguments)));
                    return Object(g) === g ? g : f
                }
                return c.apply(b, d.concat(u.call(arguments)))
            };
        return e
    }), q.touch = function() {
        var c;
        return "ontouchstart" in a || a.DocumentTouch && b instanceof DocumentTouch ? c = !0 : w(["@media (", m.join("touch-enabled),("), h, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function(a) {
            c = a.offsetTop === 9
        }), c
    }, q.backgroundsize = function() {
        return F("backgroundSize")
    }, q.csstransforms3d = function() {
        var a = !!F("perspective");
        return a && "webkitPerspective" in g.style && w("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function(b, c) {
            a = b.offsetLeft === 9 && b.offsetHeight === 3
        }), a
    }, q.csstransitions = function() {
        return F("transition")
    };
    for (var G in q) y(q, G) && (v = G.toLowerCase(), e[v] = q[G](), t.push((e[v] ? "" : "no-") + v));
    return e.addTest = function(a, b) {
            if (typeof a == "object")
                for (var d in a) y(a, d) && e.addTest(d, a[d]);
            else {
                a = a.toLowerCase();
                if (e[a] !== c) return e;
                b = typeof b == "function" ? b() : b, typeof f != "undefined" && f && (g.className += " " + (b ? "" : "no-") + a), e[a] = b
            }
            return e
        }, z(""), i = k = null,
        function(a, b) {
            function k(a, b) {
                var c = a.createElement("p"),
                    d = a.getElementsByTagName("head")[0] || a.documentElement;
                return c.innerHTML = "x<style>" + b + "</style>", d.insertBefore(c.lastChild, d.firstChild)
            }

            function l() {
                var a = r.elements;
                return typeof a == "string" ? a.split(" ") : a
            }

            function m(a) {
                var b = i[a[g]];
                return b || (b = {}, h++, a[g] = h, i[h] = b), b
            }

            function n(a, c, f) {
                c || (c = b);
                if (j) return c.createElement(a);
                f || (f = m(c));
                var g;
                return f.cache[a] ? g = f.cache[a].cloneNode() : e.test(a) ? g = (f.cache[a] = f.createElem(a)).cloneNode() : g = f.createElem(a), g.canHaveChildren && !d.test(a) ? f.frag.appendChild(g) : g
            }

            function o(a, c) {
                a || (a = b);
                if (j) return a.createDocumentFragment();
                c = c || m(a);
                var d = c.frag.cloneNode(),
                    e = 0,
                    f = l(),
                    g = f.length;
                for (; e < g; e++) d.createElement(f[e]);
                return d
            }

            function p(a, b) {
                b.cache || (b.cache = {}, b.createElem = a.createElement, b.createFrag = a.createDocumentFragment, b.frag = b.createFrag()), a.createElement = function(c) {
                    return r.shivMethods ? n(c, a, b) : b.createElem(c)
                }, a.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + l().join().replace(/\w+/g, function(a) {
                    return b.createElem(a), b.frag.createElement(a), 'c("' + a + '")'
                }) + ");return n}")(r, b.frag)
            }

            function q(a) {
                a || (a = b);
                var c = m(a);
                return r.shivCSS && !f && !c.hasCSS && (c.hasCSS = !!k(a, "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")), j || p(a, c), a
            }
            var c = a.html5 || {},
                d = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                e = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                f, g = "_html5shiv",
                h = 0,
                i = {},
                j;
            (function() {
                try {
                    var a = b.createElement("a");
                    a.innerHTML = "<xyz></xyz>", f = "hidden" in a, j = a.childNodes.length == 1 || function() {
                        b.createElement("a");
                        var a = b.createDocumentFragment();
                        return typeof a.cloneNode == "undefined" || typeof a.createDocumentFragment == "undefined" || typeof a.createElement == "undefined"
                    }()
                } catch (c) {
                    f = !0, j = !0
                }
            })();
            var r = {
                elements: c.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
                shivCSS: c.shivCSS !== !1,
                supportsUnknownElements: j,
                shivMethods: c.shivMethods !== !1,
                type: "default",
                shivDocument: q,
                createElement: n,
                createDocumentFragment: o
            };
            a.html5 = r, q(b)
        }(this, b), e._version = d, e._prefixes = m, e._domPrefixes = p, e._cssomPrefixes = o, e.testProp = function(a) {
            return D([a])
        }, e.testAllProps = F, e.testStyles = w, e.prefixed = function(a, b, c) {
            return b ? F(a, b, c) : F(a, "pfx")
        }, g.className = g.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (f ? " js " + t.join(" ") : ""), e
}(this, this.document),
function(a, b, c) {
    function d(a) {
        return "[object Function]" == o.call(a)
    }

    function e(a) {
        return "string" == typeof a
    }

    function f() {}

    function g(a) {
        return !a || "loaded" == a || "complete" == a || "uninitialized" == a
    }

    function h() {
        var a = p.shift();
        q = 1, a ? a.t ? m(function() {
            ("c" == a.t ? B.injectCss : B.injectJs)(a.s, 0, a.a, a.x, a.e, 1)
        }, 0) : (a(), h()) : q = 0
    }

    function i(a, c, d, e, f, i, j) {
        function k(b) {
            if (!o && g(l.readyState) && (u.r = o = 1, !q && h(), l.onload = l.onreadystatechange = null, b)) {
                "img" != a && m(function() {
                    t.removeChild(l)
                }, 50);
                for (var d in y[c]) y[c].hasOwnProperty(d) && y[c][d].onload()
            }
        }
        var j = j || B.errorTimeout,
            l = b.createElement(a),
            o = 0,
            r = 0,
            u = {
                t: d,
                s: c,
                e: f,
                a: i,
                x: j
            };
        1 === y[c] && (r = 1, y[c] = []), "object" == a ? l.data = c : (l.src = c, l.type = a), l.width = l.height = "0", l.onerror = l.onload = l.onreadystatechange = function() {
            k.call(this, r)
        }, p.splice(e, 0, u), "img" != a && (r || 2 === y[c] ? (t.insertBefore(l, s ? null : n), m(k, j)) : y[c].push(l))
    }

    function j(a, b, c, d, f) {
        return q = 0, b = b || "j", e(a) ? i("c" == b ? v : u, a, b, this.i++, c, d, f) : (p.splice(this.i++, 0, a), 1 == p.length && h()), this
    }

    function k() {
        var a = B;
        return a.loader = {
            load: j,
            i: 0
        }, a
    }
    var l = b.documentElement,
        m = a.setTimeout,
        n = b.getElementsByTagName("script")[0],
        o = {}.toString,
        p = [],
        q = 0,
        r = "MozAppearance" in l.style,
        s = r && !!b.createRange().compareNode,
        t = s ? l : n.parentNode,
        l = a.opera && "[object Opera]" == o.call(a.opera),
        l = !!b.attachEvent && !l,
        u = r ? "object" : l ? "script" : "img",
        v = l ? "script" : u,
        w = Array.isArray || function(a) {
            return "[object Array]" == o.call(a)
        },
        x = [],
        y = {},
        z = {
            timeout: function(a, b) {
                return b.length && (a.timeout = b[0]), a
            }
        },
        A, B;
    B = function(a) {
        function b(a) {
            var a = a.split("!"),
                b = x.length,
                c = a.pop(),
                d = a.length,
                c = {
                    url: c,
                    origUrl: c,
                    prefixes: a
                },
                e, f, g;
            for (f = 0; f < d; f++) g = a[f].split("="), (e = z[g.shift()]) && (c = e(c, g));
            for (f = 0; f < b; f++) c = x[f](c);
            return c
        }

        function g(a, e, f, g, h) {
            var i = b(a),
                j = i.autoCallback;
            i.url.split(".").pop().split("?").shift(), i.bypass || (e && (e = d(e) ? e : e[a] || e[g] || e[a.split("/").pop().split("?")[0]]), i.instead ? i.instead(a, e, f, g, h) : (y[i.url] ? i.noexec = !0 : y[i.url] = 1, f.load(i.url, i.forceCSS || !i.forceJS && "css" == i.url.split(".").pop().split("?").shift() ? "c" : c, i.noexec, i.attrs, i.timeout), (d(e) || d(j)) && f.load(function() {
                k(), e && e(i.origUrl, h, g), j && j(i.origUrl, h, g), y[i.url] = 2
            })))
        }

        function h(a, b) {
            function c(a, c) {
                if (a) {
                    if (e(a)) c || (j = function() {
                        var a = [].slice.call(arguments);
                        k.apply(this, a), l()
                    }), g(a, j, b, 0, h);
                    else if (Object(a) === a)
                        for (n in m = function() {
                            var b = 0,
                                c;
                            for (c in a) a.hasOwnProperty(c) && b++;
                            return b
                        }(), a) a.hasOwnProperty(n) && (!c && !--m && (d(j) ? j = function() {
                            var a = [].slice.call(arguments);
                            k.apply(this, a), l()
                        } : j[n] = function(a) {
                            return function() {
                                var b = [].slice.call(arguments);
                                a && a.apply(this, b), l()
                            }
                        }(k[n])), g(a[n], j, b, n, h))
                } else !c && l()
            }
            var h = !!a.test,
                i = a.load || a.both,
                j = a.callback || f,
                k = j,
                l = a.complete || f,
                m, n;
            c(h ? a.yep : a.nope, !!i), i && c(i)
        }
        var i, j, l = this.yepnope.loader;
        if (e(a)) g(a, 0, l, 0);
        else if (w(a))
            for (i = 0; i < a.length; i++) j = a[i], e(j) ? g(j, 0, l, 0) : w(j) ? B(j) : Object(j) === j && h(j, l);
        else Object(a) === a && h(a, l)
    }, B.addPrefix = function(a, b) {
        z[a] = b
    }, B.addFilter = function(a) {
        x.push(a)
    }, B.errorTimeout = 1e4, null == b.readyState && b.addEventListener && (b.readyState = "loading", b.addEventListener("DOMContentLoaded", A = function() {
        b.removeEventListener("DOMContentLoaded", A, 0), b.readyState = "complete"
    }, 0)), a.yepnope = k(), a.yepnope.executeStack = h, a.yepnope.injectJs = function(a, c, d, e, i, j) {
        var k = b.createElement("script"),
            l, o, e = e || B.errorTimeout;
        k.src = a;
        for (o in d) k.setAttribute(o, d[o]);
        c = j ? h : c || f, k.onreadystatechange = k.onload = function() {
            !l && g(k.readyState) && (l = 1, c(), k.onload = k.onreadystatechange = null)
        }, m(function() {
            l || (l = 1, c(1))
        }, e), i ? k.onload() : n.parentNode.insertBefore(k, n)
    }, a.yepnope.injectCss = function(a, c, d, e, g, i) {
        var e = b.createElement("link"),
            j, c = i ? h : c || f;
        e.href = a, e.rel = "stylesheet", e.type = "text/css";
        for (j in d) e.setAttribute(j, d[j]);
        g || (n.parentNode.insertBefore(e, n), m(c, 0))
    }
}(this, document), Modernizr.load = function() {
    yepnope.apply(window, [].slice.call(arguments, 0))
};;/* jquery.nicescroll
-- version 3.5.4
-- copyright 2013-11-13 InuYaksa*2013
-- licensed under the MIT
--
-- http://areaaperta.com/nicescroll
-- https://github.com/inuyaksa/jquery.nicescroll
--
*/

(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function(jQuery) {

    // globals
    var domfocus = false;
    var mousefocus = false;
    var zoomactive = false;
    var tabindexcounter = 5000;
    var ascrailcounter = 2000;
    var globalmaxzindex = 0;

    var $ = jQuery; // sandbox

    // http://stackoverflow.com/questions/2161159/get-script-path
    function getScriptPath() {
        var scripts = document.getElementsByTagName('script');
        var path = scripts[scripts.length - 1].src.split('?')[0];
        return (path.split('/').length > 0) ? path.split('/').slice(0, -1).join('/') + '/' : '';
    }
    //  var scriptpath = getScriptPath();

    var vendors = ['ms', 'moz', 'webkit', 'o'];

    var setAnimationFrame = window.requestAnimationFrame || false;
    var clearAnimationFrame = window.cancelAnimationFrame || false;

    if (!setAnimationFrame) {
        for (var vx in vendors) {
            var v = vendors[vx];
            if (!setAnimationFrame) setAnimationFrame = window[v + 'RequestAnimationFrame'];
            if (!clearAnimationFrame) clearAnimationFrame = window[v + 'CancelAnimationFrame'] || window[v + 'CancelRequestAnimationFrame'];
        }
    }

    var clsMutationObserver = window.MutationObserver || window.WebKitMutationObserver || false;

    var _globaloptions = {
        zindex: "auto",
        cursoropacitymin: 0,
        cursoropacitymax: 1,
        cursorcolor: "#424242",
        cursorwidth: "5px",
        cursorborder: "1px solid #fff",
        cursorborderradius: "5px",
        scrollspeed: 60,
        mousescrollstep: 8 * 3,
        touchbehavior: false,
        hwacceleration: true,
        usetransition: true,
        boxzoom: false,
        dblclickzoom: true,
        gesturezoom: true,
        grabcursorenabled: true,
        autohidemode: true,
        background: "",
        iframeautoresize: true,
        cursorminheight: 32,
        preservenativescrolling: true,
        railoffset: false,
        bouncescroll: true,
        spacebarenabled: true,
        railpadding: {
            top: 0,
            right: 0,
            left: 0,
            bottom: 0
        },
        disableoutline: true,
        horizrailenabled: true,
        railalign: "right",
        railvalign: "bottom",
        enabletranslate3d: true,
        enablemousewheel: true,
        enablekeyboard: true,
        smoothscroll: true,
        sensitiverail: true,
        enablemouselockapi: true,
        //      cursormaxheight:false,
        cursorfixedheight: false,
        directionlockdeadzone: 6,
        hidecursordelay: 400,
        nativeparentscrolling: true,
        enablescrollonselection: true,
        overflowx: true,
        overflowy: true,
        cursordragspeed: 0.3,
        rtlmode: "auto",
        cursordragontouch: false,
        oneaxismousemode: "auto",
        scriptpath: getScriptPath()
    };

    var browserdetected = false;

    var getBrowserDetection = function() {

        if (browserdetected) return browserdetected;

        var domtest = document.createElement('DIV');

        var d = {};

        d.haspointerlock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;

        d.isopera = ("opera" in window);
        d.isopera12 = (d.isopera && ("getUserMedia" in navigator));
        d.isoperamini = (Object.prototype.toString.call(window.operamini) === "[object OperaMini]");

        d.isie = (("all" in document) && ("attachEvent" in domtest) && !d.isopera);
        d.isieold = (d.isie && !("msInterpolationMode" in domtest.style)); // IE6 and older
        d.isie7 = d.isie && !d.isieold && (!("documentMode" in document) || (document.documentMode == 7));
        d.isie8 = d.isie && ("documentMode" in document) && (document.documentMode == 8);
        d.isie9 = d.isie && ("performance" in window) && (document.documentMode >= 9);
        d.isie10 = d.isie && ("performance" in window) && (document.documentMode >= 10);

        d.isie9mobile = /iemobile.9/i.test(navigator.userAgent); //wp 7.1 mango
        if (d.isie9mobile) d.isie9 = false;
        d.isie7mobile = (!d.isie9mobile && d.isie7) && /iemobile/i.test(navigator.userAgent); //wp 7.0

        d.ismozilla = ("MozAppearance" in domtest.style);

        d.iswebkit = ("WebkitAppearance" in domtest.style);

        d.ischrome = ("chrome" in window);
        d.ischrome22 = (d.ischrome && d.haspointerlock);
        d.ischrome26 = (d.ischrome && ("transition" in domtest.style)); // issue with transform detection (maintain prefix)

        d.cantouch = ("ontouchstart" in document.documentElement) || ("ontouchstart" in window); // detection for Chrome Touch Emulation
        d.hasmstouch = (window.navigator.msPointerEnabled || false); // IE10+ pointer events

        d.ismac = /^mac$/i.test(navigator.platform);

        d.isios = (d.cantouch && /iphone|ipad|ipod/i.test(navigator.platform));
        d.isios4 = ((d.isios) && !("seal" in Object));

        d.isandroid = (/android/i.test(navigator.userAgent));

        d.trstyle = false;
        d.hastransform = false;
        d.hastranslate3d = false;
        d.transitionstyle = false;
        d.hastransition = false;
        d.transitionend = false;

        var check = ['transform', 'msTransform', 'webkitTransform', 'MozTransform', 'OTransform'];
        for (var a = 0; a < check.length; a++) {
            if (typeof domtest.style[check[a]] != "undefined") {
                d.trstyle = check[a];
                break;
            }
        }
        d.hastransform = (d.trstyle != false);
        if (d.hastransform) {
            domtest.style[d.trstyle] = "translate3d(1px,2px,3px)";
            d.hastranslate3d = /translate3d/.test(domtest.style[d.trstyle]);
        }

        d.transitionstyle = false;
        d.prefixstyle = '';
        d.transitionend = false;
        var check = ['transition', 'webkitTransition', 'MozTransition', 'OTransition', 'OTransition', 'msTransition', 'KhtmlTransition'];
        var prefix = ['', '-webkit-', '-moz-', '-o-', '-o', '-ms-', '-khtml-'];
        var evs = ['transitionend', 'webkitTransitionEnd', 'transitionend', 'otransitionend', 'oTransitionEnd', 'msTransitionEnd', 'KhtmlTransitionEnd'];
        for (var a = 0; a < check.length; a++) {
            if (check[a] in domtest.style) {
                d.transitionstyle = check[a];
                d.prefixstyle = prefix[a];
                d.transitionend = evs[a];
                break;
            }
        }
        if (d.ischrome26) { // use always prefix
            d.prefixstyle = prefix[1];
        }

        d.hastransition = (d.transitionstyle);

        function detectCursorGrab() {
            var lst = ['-moz-grab', '-webkit-grab', 'grab'];
            if ((d.ischrome && !d.ischrome22) || d.isie) lst = []; // force setting for IE returns false positive and chrome cursor bug
            for (var a = 0; a < lst.length; a++) {
                var p = lst[a];
                domtest.style['cursor'] = p;
                if (domtest.style['cursor'] == p) return p;
            }
            return 'url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize'; // thank you google for custom cursor!
        }
        d.cursorgrabvalue = detectCursorGrab();

        d.hasmousecapture = ("setCapture" in domtest);

        d.hasMutationObserver = (clsMutationObserver !== false);

        domtest = null; //memory released

        browserdetected = d;

        return d;
    };

    var NiceScrollClass = function(myopt, me) {

        var self = this;

        this.version = '3.5.4';
        this.name = 'nicescroll';

        this.me = me;

        this.opt = {
            doc: $("body"),
            win: false
        };

        $.extend(this.opt, _globaloptions);

        // Options for internal use
        this.opt.snapbackspeed = 80;

        if (myopt || false) {
            for (var a in self.opt) {
                if (typeof myopt[a] != "undefined") self.opt[a] = myopt[a];
            }
        }

        this.doc = self.opt.doc;
        this.iddoc = (this.doc && this.doc[0]) ? this.doc[0].id || '' : '';
        this.ispage = /^BODY|HTML/.test((self.opt.win) ? self.opt.win[0].nodeName : this.doc[0].nodeName);
        this.haswrapper = (self.opt.win !== false);
        this.win = self.opt.win || (this.ispage ? $(window) : this.doc);
        this.docscroll = (this.ispage && !this.haswrapper) ? $(window) : this.win;
        this.body = $("body");
        this.viewport = false;

        this.isfixed = false;

        this.iframe = false;
        this.isiframe = ((this.doc[0].nodeName == 'IFRAME') && (this.win[0].nodeName == 'IFRAME'));

        this.istextarea = (this.win[0].nodeName == 'TEXTAREA');

        this.forcescreen = false; //force to use screen position on events

        this.canshowonmouseevent = (self.opt.autohidemode != "scroll");

        // Events jump table    
        this.onmousedown = false;
        this.onmouseup = false;
        this.onmousemove = false;
        this.onmousewheel = false;
        this.onkeypress = false;
        this.ongesturezoom = false;
        this.onclick = false;

        // Nicescroll custom events
        this.onscrollstart = false;
        this.onscrollend = false;
        this.onscrollcancel = false;

        this.onzoomin = false;
        this.onzoomout = false;

        // Let's start!  
        this.view = false;
        this.page = false;

        this.scroll = {
            x: 0,
            y: 0
        };
        this.scrollratio = {
            x: 0,
            y: 0
        };
        this.cursorheight = 20;
        this.scrollvaluemax = 0;

        this.isrtlmode = false; //(this.opt.rtlmode=="auto") ? (this.win.css("direction")=="rtl") : (this.opt.rtlmode===true);
        //    this.checkrtlmode = false;

        this.scrollrunning = false;

        this.scrollmom = false;

        this.observer = false;
        this.observerremover = false; // observer on parent for remove detection

        do {
            this.id = "ascrail" + (ascrailcounter++);
        } while (document.getElementById(this.id));

        this.rail = false;
        this.cursor = false;
        this.cursorfreezed = false;
        this.selectiondrag = false;

        this.zoom = false;
        this.zoomactive = false;

        this.hasfocus = false;
        this.hasmousefocus = false;

        this.visibility = true;
        this.locked = false;
        this.hidden = false; // rails always hidden
        this.cursoractive = true; // user can interact with cursors

        this.wheelprevented = false; //prevent mousewheel event

        this.overflowx = self.opt.overflowx;
        this.overflowy = self.opt.overflowy;

        this.nativescrollingarea = false;
        this.checkarea = 0;

        this.events = []; // event list for unbind

        this.saved = {};

        this.delaylist = {};
        this.synclist = {};

        this.lastdeltax = 0;
        this.lastdeltay = 0;

        this.detected = getBrowserDetection();

        var cap = $.extend({}, this.detected);

        this.canhwscroll = (cap.hastransform && self.opt.hwacceleration);
        this.ishwscroll = (this.canhwscroll && self.haswrapper);

        this.istouchcapable = false; // desktop devices with touch screen support

        //## Check Chrome desktop with touch support
        if (cap.cantouch && cap.ischrome && !cap.isios && !cap.isandroid) {
            this.istouchcapable = true;
            cap.cantouch = false; // parse normal desktop events
        }

        //## Firefox 18 nightly build (desktop) false positive (or desktop with touch support)
        if (cap.cantouch && cap.ismozilla && !cap.isios && !cap.isandroid) {
            this.istouchcapable = true;
            cap.cantouch = false; // parse normal desktop events
        }

        //## disable MouseLock API on user request

        if (!self.opt.enablemouselockapi) {
            cap.hasmousecapture = false;
            cap.haspointerlock = false;
        }

        this.delayed = function(name, fn, tm, lazy) {
            var dd = self.delaylist[name];
            var nw = (new Date()).getTime();
            if (!lazy && dd && dd.tt) return false;
            if (dd && dd.tt) clearTimeout(dd.tt);
            if (dd && dd.last + tm > nw && !dd.tt) {
                self.delaylist[name] = {
                    last: nw + tm,
                    tt: setTimeout(function() {
                        if (self || false) {
                            self.delaylist[name].tt = 0;
                            fn.call()
                        }
                    }, tm)
                }
            } else if (!dd || !dd.tt) {
                self.delaylist[name] = {
                    last: nw,
                    tt: 0
                };
                setTimeout(function() {
                    fn.call();
                }, 0);
            }
        };

        this.debounced = function(name, fn, tm) {
            var dd = self.delaylist[name];
            var nw = (new Date()).getTime();
            self.delaylist[name] = fn;
            if (!dd) {
                setTimeout(function() {
                    var fn = self.delaylist[name];
                    self.delaylist[name] = false;
                    fn.call();
                }, tm);
            }
        };

        var _onsync = false;

        this.synched = function(name, fn) {

            function requestSync() {
                if (_onsync) return;
                setAnimationFrame(function() {
                    _onsync = false;
                    for (name in self.synclist) {
                        var fn = self.synclist[name];
                        if (fn) fn.call(self);
                        self.synclist[name] = false;
                    }
                });
                _onsync = true;
            };

            self.synclist[name] = fn;
            requestSync();
            return name;
        };

        this.unsynched = function(name) {
            if (self.synclist[name]) self.synclist[name] = false;
        };

        this.css = function(el, pars) { // save & set
            for (var n in pars) {
                self.saved.css.push([el, n, el.css(n)]);
                el.css(n, pars[n]);
            }
        };

        this.scrollTop = function(val) {
            return (typeof val == "undefined") ? self.getScrollTop() : self.setScrollTop(val);
        };

        this.scrollLeft = function(val) {
            return (typeof val == "undefined") ? self.getScrollLeft() : self.setScrollLeft(val);
        };

        // derived by by Dan Pupius www.pupius.net
        BezierClass = function(st, ed, spd, p1, p2, p3, p4) {
            this.st = st;
            this.ed = ed;
            this.spd = spd;

            this.p1 = p1 || 0;
            this.p2 = p2 || 1;
            this.p3 = p3 || 0;
            this.p4 = p4 || 1;

            this.ts = (new Date()).getTime();
            this.df = this.ed - this.st;
        };
        BezierClass.prototype = {
            B2: function(t) {
                return 3 * t * t * (1 - t)
            },
            B3: function(t) {
                return 3 * t * (1 - t) * (1 - t)
            },
            B4: function(t) {
                return (1 - t) * (1 - t) * (1 - t)
            },
            getNow: function() {
                var nw = (new Date()).getTime();
                var pc = 1 - ((nw - this.ts) / this.spd);
                var bz = this.B2(pc) + this.B3(pc) + this.B4(pc);
                return (pc < 0) ? this.ed : this.st + Math.round(this.df * bz);
            },
            update: function(ed, spd) {
                this.st = this.getNow();
                this.ed = ed;
                this.spd = spd;
                this.ts = (new Date()).getTime();
                this.df = this.ed - this.st;
                return this;
            }
        };

        if (this.ishwscroll) {
            // hw accelerated scroll
            this.doc.translate = {
                x: 0,
                y: 0,
                tx: "0px",
                ty: "0px"
            };

            //this one can help to enable hw accel on ios6 http://indiegamr.com/ios6-html-hardware-acceleration-changes-and-how-to-fix-them/
            if (cap.hastranslate3d && cap.isios) this.doc.css("-webkit-backface-visibility", "hidden"); // prevent flickering http://stackoverflow.com/questions/3461441/      

            //derived from http://stackoverflow.com/questions/11236090/
            function getMatrixValues() {
                var tr = self.doc.css(cap.trstyle);
                if (tr && (tr.substr(0, 6) == "matrix")) {
                    return tr.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, '').split(/, +/);
                }
                return false;
            }

            this.getScrollTop = function(last) {
                if (!last) {
                    var mtx = getMatrixValues();
                    if (mtx) return (mtx.length == 16) ? -mtx[13] : -mtx[5]; //matrix3d 16 on IE10
                    if (self.timerscroll && self.timerscroll.bz) return self.timerscroll.bz.getNow();
                }
                return self.doc.translate.y;
            };

            this.getScrollLeft = function(last) {
                if (!last) {
                    var mtx = getMatrixValues();
                    if (mtx) return (mtx.length == 16) ? -mtx[12] : -mtx[4]; //matrix3d 16 on IE10
                    if (self.timerscroll && self.timerscroll.bh) return self.timerscroll.bh.getNow();
                }
                return self.doc.translate.x;
            };

            if (document.createEvent) {
                this.notifyScrollEvent = function(el) {
                    var e = document.createEvent("UIEvents");
                    e.initUIEvent("scroll", false, true, window, 1);
                    el.dispatchEvent(e);
                };
            } else if (document.fireEvent) {
                this.notifyScrollEvent = function(el) {
                    var e = document.createEventObject();
                    el.fireEvent("onscroll");
                    e.cancelBubble = true;
                };
            } else {
                this.notifyScrollEvent = function(el, add) {}; //NOPE
            }

            var cxscrollleft = -1; //(this.isrtlmode) ? 1 : -1;

            if (cap.hastranslate3d && self.opt.enabletranslate3d) {
                this.setScrollTop = function(val, silent) {
                    self.doc.translate.y = val;
                    self.doc.translate.ty = (val * -1) + "px";
                    self.doc.css(cap.trstyle, "translate3d(" + self.doc.translate.tx + "," + self.doc.translate.ty + ",0px)");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
                this.setScrollLeft = function(val, silent) {
                    self.doc.translate.x = val;
                    self.doc.translate.tx = (val * cxscrollleft) + "px";
                    self.doc.css(cap.trstyle, "translate3d(" + self.doc.translate.tx + "," + self.doc.translate.ty + ",0px)");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
            } else {
                this.setScrollTop = function(val, silent) {
                    self.doc.translate.y = val;
                    self.doc.translate.ty = (val * -1) + "px";
                    self.doc.css(cap.trstyle, "translate(" + self.doc.translate.tx + "," + self.doc.translate.ty + ")");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
                this.setScrollLeft = function(val, silent) {
                    self.doc.translate.x = val;
                    self.doc.translate.tx = (val * cxscrollleft) + "px";
                    self.doc.css(cap.trstyle, "translate(" + self.doc.translate.tx + "," + self.doc.translate.ty + ")");
                    if (!silent) self.notifyScrollEvent(self.win[0]);
                };
            }
        } else {
            // native scroll
            this.getScrollTop = function() {
                return self.docscroll.scrollTop();
            };
            this.setScrollTop = function(val) {
                return self.docscroll.scrollTop(val);
            };
            this.getScrollLeft = function() {
                return self.docscroll.scrollLeft();
            };
            this.setScrollLeft = function(val) {
                return self.docscroll.scrollLeft(val);
            };
        }

        this.getTarget = function(e) {
            if (!e) return false;
            if (e.target) return e.target;
            if (e.srcElement) return e.srcElement;
            return false;
        };

        this.hasParent = function(e, id) {
            if (!e) return false;
            var el = e.target || e.srcElement || e || false;
            while (el && el.id != id) {
                el = el.parentNode || false;
            }
            return (el !== false);
        };

        function getZIndex() {
            var dom = self.win;
            if ("zIndex" in dom) return dom.zIndex(); // use jQuery UI method when available
            while (dom.length > 0) {
                if (dom[0].nodeType == 9) return false;
                var zi = dom.css('zIndex');
                if (!isNaN(zi) && zi != 0) return parseInt(zi);
                dom = dom.parent();
            }
            return false;
        };

        //inspired by http://forum.jquery.com/topic/width-includes-border-width-when-set-to-thin-medium-thick-in-ie
        var _convertBorderWidth = {
            "thin": 1,
            "medium": 3,
            "thick": 5
        };

        function getWidthToPixel(dom, prop, chkheight) {
            var wd = dom.css(prop);
            var px = parseFloat(wd);
            if (isNaN(px)) {
                px = _convertBorderWidth[wd] || 0;
                var brd = (px == 3) ? ((chkheight) ? (self.win.outerHeight() - self.win.innerHeight()) : (self.win.outerWidth() - self.win.innerWidth())) : 1; //DON'T TRUST CSS
                if (self.isie8 && px) px += 1;
                return (brd) ? px : 0;
            }
            return px;
        };

        this.getOffset = function() {
            if (self.isfixed) return {
                top: parseFloat(self.win.css('top')),
                left: parseFloat(self.win.css('left'))
            };
            if (!self.viewport) return self.win.offset();
            var ww = self.win.offset();
            var vp = self.viewport.offset();
            return {
                top: ww.top - vp.top + self.viewport.scrollTop(),
                left: ww.left - vp.left + self.viewport.scrollLeft()
            };
        };

        this.updateScrollBar = function(len) {
            if (self.ishwscroll) {
                self.rail.css({
                    height: self.win.innerHeight()
                });
                if (self.railh) self.railh.css({
                    width: self.win.innerWidth()
                });
            } else {
                var wpos = self.getOffset();
                var pos = {
                    top: wpos.top,
                    left: wpos.left
                };
                pos.top += getWidthToPixel(self.win, 'border-top-width', true);
                var brd = (self.win.outerWidth() - self.win.innerWidth()) / 2;
                pos.left += (self.rail.align) ? self.win.outerWidth() - getWidthToPixel(self.win, 'border-right-width') - self.rail.width : getWidthToPixel(self.win, 'border-left-width');

                var off = self.opt.railoffset;
                if (off) {
                    if (off.top) pos.top += off.top;
                    if (self.rail.align && off.left) pos.left += off.left;
                }

                if (!self.locked) self.rail.css({
                    top: pos.top,
                    left: pos.left,
                    height: (len) ? len.h : self.win.innerHeight()
                });

                if (self.zoom) {
                    self.zoom.css({
                        top: pos.top + 1,
                        left: (self.rail.align == 1) ? pos.left - 20 : pos.left + self.rail.width + 4
                    });
                }

                if (self.railh && !self.locked) {
                    var pos = {
                        top: wpos.top,
                        left: wpos.left
                    };
                    var y = (self.railh.align) ? pos.top + getWidthToPixel(self.win, 'border-top-width', true) + self.win.innerHeight() - self.railh.height : pos.top + getWidthToPixel(self.win, 'border-top-width', true);
                    var x = pos.left + getWidthToPixel(self.win, 'border-left-width');
                    self.railh.css({
                        top: y,
                        left: x,
                        width: self.railh.width
                    });
                }


            }
        };

        this.doRailClick = function(e, dbl, hr) {

            var fn, pg, cur, pos;

            //      if (self.rail.drag&&self.rail.drag.pt!=1) return;
            if (self.locked) return;
            //      if (self.rail.drag) return;

            //      self.cancelScroll();       

            self.cancelEvent(e);

            if (dbl) {
                fn = (hr) ? self.doScrollLeft : self.doScrollTop;
                cur = (hr) ? ((e.pageX - self.railh.offset().left - (self.cursorwidth / 2)) * self.scrollratio.x) : ((e.pageY - self.rail.offset().top - (self.cursorheight / 2)) * self.scrollratio.y);
                fn(cur);
            } else {
                fn = (hr) ? self.doScrollLeftBy : self.doScrollBy;
                cur = (hr) ? self.scroll.x : self.scroll.y;
                pos = (hr) ? e.pageX - self.railh.offset().left : e.pageY - self.rail.offset().top;
                pg = (hr) ? self.view.w : self.view.h;
                (cur >= pos) ? fn(pg) : fn(-pg);
            }

        };

        self.hasanimationframe = (setAnimationFrame);
        self.hascancelanimationframe = (clearAnimationFrame);

        if (!self.hasanimationframe) {
            setAnimationFrame = function(fn) {
                return setTimeout(fn, 15 - Math.floor((+new Date) / 1000) % 16)
            }; // 1000/60)};
            clearAnimationFrame = clearInterval;
        } else if (!self.hascancelanimationframe) clearAnimationFrame = function() {
            self.cancelAnimationFrame = true
        };

        this.init = function() {

            self.saved.css = [];

            if (cap.isie7mobile) return true; // SORRY, DO NOT WORK!
            if (cap.isoperamini) return true; // SORRY, DO NOT WORK!

            if (cap.hasmstouch) self.css((self.ispage) ? $("html") : self.win, {
                '-ms-touch-action': 'none'
            });

            self.zindex = "auto";
            if (!self.ispage && self.opt.zindex == "auto") {
                self.zindex = getZIndex() || "auto";
            } else {
                self.zindex = self.opt.zindex;
            }

            if (!self.ispage && self.zindex != "auto") {
                if (self.zindex > globalmaxzindex) globalmaxzindex = self.zindex;
            }

            if (self.isie && self.zindex == 0 && self.opt.zindex == "auto") { // fix IE auto == 0
                self.zindex = "auto";
            }

            /*      
      self.ispage = true;
      self.haswrapper = true;
//      self.win = $(window);
      self.docscroll = $("body");
//      self.doc = $("body");
*/

            if (!self.ispage || (!cap.cantouch && !cap.isieold && !cap.isie9mobile)) {

                var cont = self.docscroll;
                if (self.ispage) cont = (self.haswrapper) ? self.win : self.doc;

                if (!cap.isie9mobile) self.css(cont, {
                    'overflow-y': 'hidden'
                });

                if (self.ispage && cap.isie7) {
                    if (self.doc[0].nodeName == 'BODY') self.css($("html"), {
                        'overflow-y': 'hidden'
                    }); //IE7 double scrollbar issue
                    else if (self.doc[0].nodeName == 'HTML') self.css($("body"), {
                        'overflow-y': 'hidden'
                    }); //IE7 double scrollbar issue
                }

                if (cap.isios && !self.ispage && !self.haswrapper) self.css($("body"), {
                    "-webkit-overflow-scrolling": "touch"
                }); //force hw acceleration

                var cursor = $(document.createElement('div'));
                cursor.css({
                    position: "relative",
                    top: 0,
                    "float": "right",
                    width: self.opt.cursorwidth,
                    height: "0px",
                    'background-color': self.opt.cursorcolor,
                    border: self.opt.cursorborder,
                    'background-clip': 'padding-box',
                    '-webkit-border-radius': self.opt.cursorborderradius,
                    '-moz-border-radius': self.opt.cursorborderradius,
                    'border-radius': self.opt.cursorborderradius
                });

                cursor.hborder = parseFloat(cursor.outerHeight() - cursor.innerHeight());
                self.cursor = cursor;

                var rail = $(document.createElement('div'));
                rail.attr('id', self.id);
                rail.addClass('nicescroll-rails');

                var v, a, kp = ["left", "right"]; //"top","bottom"
                for (var n in kp) {
                    a = kp[n];
                    v = self.opt.railpadding[a];
                    (v) ? rail.css("padding-" + a, v + "px") : self.opt.railpadding[a] = 0;
                }

                rail.append(cursor);

                rail.width = Math.max(parseFloat(self.opt.cursorwidth), cursor.outerWidth()) + self.opt.railpadding['left'] + self.opt.railpadding['right'];
                rail.css({
                    width: rail.width + "px",
                    'zIndex': self.zindex,
                    "background": self.opt.background,
                    cursor: "default"
                });

                rail.visibility = true;
                rail.scrollable = true;

                rail.align = (self.opt.railalign == "left") ? 0 : 1;

                self.rail = rail;

                self.rail.drag = false;

                var zoom = false;
                if (self.opt.boxzoom && !self.ispage && !cap.isieold) {
                    zoom = document.createElement('div');
                    self.bind(zoom, "click", self.doZoom);
                    self.zoom = $(zoom);
                    self.zoom.css({
                        "cursor": "pointer",
                        'z-index': self.zindex,
                        // 'backgroundImage': 'url(' + self.opt.scriptpath + 'zoomico.png)',
                        'height': 18,
                        'width': 18,
                        'backgroundPosition': '0px 0px'
                    });
                    if (self.opt.dblclickzoom) self.bind(self.win, "dblclick", self.doZoom);
                    if (cap.cantouch && self.opt.gesturezoom) {
                        self.ongesturezoom = function(e) {
                            if (e.scale > 1.5) self.doZoomIn(e);
                            if (e.scale < 0.8) self.doZoomOut(e);
                            return self.cancelEvent(e);
                        };
                        self.bind(self.win, "gestureend", self.ongesturezoom);
                    }
                }

                // init HORIZ

                self.railh = false;

                if (self.opt.horizrailenabled) {

                    self.css(cont, {
                        'overflow-x': 'hidden'
                    });

                    var cursor = $(document.createElement('div'));
                    cursor.css({
                        position: "relative",
                        top: 0,
                        height: self.opt.cursorwidth,
                        width: "0px",
                        'background-color': self.opt.cursorcolor,
                        border: self.opt.cursorborder,
                        'background-clip': 'padding-box',
                        '-webkit-border-radius': self.opt.cursorborderradius,
                        '-moz-border-radius': self.opt.cursorborderradius,
                        'border-radius': self.opt.cursorborderradius
                    });

                    cursor.wborder = parseFloat(cursor.outerWidth() - cursor.innerWidth());
                    self.cursorh = cursor;

                    var railh = $(document.createElement('div'));
                    railh.attr('id', self.id + '-hr');
                    railh.addClass('nicescroll-rails');
                    railh.height = Math.max(parseFloat(self.opt.cursorwidth), cursor.outerHeight());
                    railh.css({
                        height: railh.height + "px",
                        'zIndex': self.zindex,
                        "background": self.opt.background
                    });

                    railh.append(cursor);

                    railh.visibility = true;
                    railh.scrollable = true;

                    railh.align = (self.opt.railvalign == "top") ? 0 : 1;

                    self.railh = railh;

                    self.railh.drag = false;

                }

                //        

                if (self.ispage) {
                    rail.css({
                        position: "fixed",
                        top: "0px",
                        height: "100%"
                    });
                    (rail.align) ? rail.css({
                        right: "0px"
                    }) : rail.css({
                        left: "0px"
                    });
                    self.body.append(rail);
                    if (self.railh) {
                        railh.css({
                            position: "fixed",
                            left: "0px",
                            width: "100%"
                        });
                        (railh.align) ? railh.css({
                            bottom: "0px"
                        }) : railh.css({
                            top: "0px"
                        });
                        self.body.append(railh);
                    }
                } else {
                    if (self.ishwscroll) {
                        if (self.win.css('position') == 'static') self.css(self.win, {
                            'position': 'relative'
                        });
                        var bd = (self.win[0].nodeName == 'HTML') ? self.body : self.win;
                        if (self.zoom) {
                            self.zoom.css({
                                position: "absolute",
                                top: 1,
                                right: 0,
                                "margin-right": rail.width + 4
                            });
                            bd.append(self.zoom);
                        }
                        rail.css({
                            position: "absolute",
                            top: 0
                        });
                        (rail.align) ? rail.css({
                            right: 0
                        }) : rail.css({
                            left: 0
                        });
                        bd.append(rail);
                        if (railh) {
                            railh.css({
                                position: "absolute",
                                left: 0,
                                bottom: 0
                            });
                            (railh.align) ? railh.css({
                                bottom: 0
                            }) : railh.css({
                                top: 0
                            });
                            bd.append(railh);
                        }
                    } else {
                        self.isfixed = (self.win.css("position") == "fixed");
                        var rlpos = (self.isfixed) ? "fixed" : "absolute";

                        if (!self.isfixed) self.viewport = self.getViewport(self.win[0]);
                        if (self.viewport) {
                            self.body = self.viewport;
                            if ((/fixed|relative|absolute/.test(self.viewport.css("position"))) == false) self.css(self.viewport, {
                                "position": "relative"
                            });
                        }

                        rail.css({
                            position: rlpos
                        });
                        if (self.zoom) self.zoom.css({
                            position: rlpos
                        });
                        self.updateScrollBar();
                        self.body.append(rail);
                        if (self.zoom) self.body.append(self.zoom);
                        if (self.railh) {
                            railh.css({
                                position: rlpos
                            });
                            self.body.append(railh);
                        }
                    }

                    if (cap.isios) self.css(self.win, {
                        '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
                        '-webkit-touch-callout': 'none'
                    }); // prevent grey layer on click

                    if (cap.isie && self.opt.disableoutline) self.win.attr("hideFocus", "true"); // IE, prevent dotted rectangle on focused div
                    if (cap.iswebkit && self.opt.disableoutline) self.win.css({
                        "outline": "none"
                    });
                    //          if (cap.isopera&&self.opt.disableoutline) self.win.css({"outline":"0"});  // Opera to test [TODO]

                }

                if (self.opt.autohidemode === false) {
                    self.autohidedom = false;
                    self.rail.css({
                        opacity: self.opt.cursoropacitymax
                    });
                    if (self.railh) self.railh.css({
                        opacity: self.opt.cursoropacitymax
                    });
                } else if ((self.opt.autohidemode === true) || (self.opt.autohidemode === "leave")) {
                    self.autohidedom = $().add(self.rail);
                    if (cap.isie8) self.autohidedom = self.autohidedom.add(self.cursor);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
                    if (self.railh && cap.isie8) self.autohidedom = self.autohidedom.add(self.cursorh);
                } else if (self.opt.autohidemode == "scroll") {
                    self.autohidedom = $().add(self.rail);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.railh);
                } else if (self.opt.autohidemode == "cursor") {
                    self.autohidedom = $().add(self.cursor);
                    if (self.railh) self.autohidedom = self.autohidedom.add(self.cursorh);
                } else if (self.opt.autohidemode == "hidden") {
                    self.autohidedom = false;
                    self.hide();
                    self.locked = false;
                }

                if (cap.isie9mobile) {

                    self.scrollmom = new ScrollMomentumClass2D(self);

                    /*
          var trace = function(msg) {
            var db = $("#debug");
            if (isNaN(msg)&&(typeof msg != "string")) {
              var x = [];
              for(var a in msg) {
                x.push(a+":"+msg[a]);
              }
              msg ="{"+x.join(",")+"}";
            }
            if (db.children().length>0) {
              db.children().eq(0).before("<div>"+msg+"</div>");
            } else {
              db.append("<div>"+msg+"</div>");
            }
          }
          window.onerror = function(msg,url,ln) {
            trace("ERR: "+msg+" at "+ln);
          }
*/

                    self.onmangotouch = function(e) {
                        var py = self.getScrollTop();
                        var px = self.getScrollLeft();

                        if ((py == self.scrollmom.lastscrolly) && (px == self.scrollmom.lastscrollx)) return true;
                        //            $("#debug").html('DRAG:'+py);

                        var dfy = py - self.mangotouch.sy;
                        var dfx = px - self.mangotouch.sx;
                        var df = Math.round(Math.sqrt(Math.pow(dfx, 2) + Math.pow(dfy, 2)));
                        if (df == 0) return;

                        var dry = (dfy < 0) ? -1 : 1;
                        var drx = (dfx < 0) ? -1 : 1;

                        var tm = +new Date();
                        if (self.mangotouch.lazy) clearTimeout(self.mangotouch.lazy);

                        if (((tm - self.mangotouch.tm) > 80) || (self.mangotouch.dry != dry) || (self.mangotouch.drx != drx)) {
                            //              trace('RESET+'+(tm-self.mangotouch.tm));
                            self.scrollmom.stop();
                            self.scrollmom.reset(px, py);
                            self.mangotouch.sy = py;
                            self.mangotouch.ly = py;
                            self.mangotouch.sx = px;
                            self.mangotouch.lx = px;
                            self.mangotouch.dry = dry;
                            self.mangotouch.drx = drx;
                            self.mangotouch.tm = tm;
                        } else {

                            self.scrollmom.stop();
                            self.scrollmom.update(self.mangotouch.sx - dfx, self.mangotouch.sy - dfy);
                            var gap = tm - self.mangotouch.tm;
                            self.mangotouch.tm = tm;

                            //              trace('MOVE:'+df+" - "+gap);

                            var ds = Math.max(Math.abs(self.mangotouch.ly - py), Math.abs(self.mangotouch.lx - px));
                            self.mangotouch.ly = py;
                            self.mangotouch.lx = px;

                            if (ds > 2) {
                                self.mangotouch.lazy = setTimeout(function() {
                                    //                  trace('END:'+ds+'+'+gap);                  
                                    self.mangotouch.lazy = false;
                                    self.mangotouch.dry = 0;
                                    self.mangotouch.drx = 0;
                                    self.mangotouch.tm = 0;
                                    self.scrollmom.doMomentum(30);
                                }, 100);
                            }
                        }
                    };

                    var top = self.getScrollTop();
                    var lef = self.getScrollLeft();
                    self.mangotouch = {
                        sy: top,
                        ly: top,
                        dry: 0,
                        sx: lef,
                        lx: lef,
                        drx: 0,
                        lazy: false,
                        tm: 0
                    };

                    self.bind(self.docscroll, "scroll", self.onmangotouch);

                } else {

                    if (cap.cantouch || self.istouchcapable || self.opt.touchbehavior || cap.hasmstouch) {

                        self.scrollmom = new ScrollMomentumClass2D(self);

                        self.ontouchstart = function(e) {
                            if (e.pointerType && e.pointerType != 2) return false;

                            self.hasmoving = false;

                            if (!self.locked) {

                                if (cap.hasmstouch) {
                                    var tg = (e.target) ? e.target : false;
                                    while (tg) {
                                        var nc = $(tg).getNiceScroll();
                                        if ((nc.length > 0) && (nc[0].me == self.me)) break;
                                        if (nc.length > 0) return false;
                                        if ((tg.nodeName == 'DIV') && (tg.id == self.id)) break;
                                        tg = (tg.parentNode) ? tg.parentNode : false;
                                    }
                                }

                                self.cancelScroll();

                                var tg = self.getTarget(e);

                                if (tg) {
                                    var skp = (/INPUT/i.test(tg.nodeName)) && (/range/i.test(tg.type));
                                    if (skp) return self.stopPropagation(e);
                                }

                                if (!("clientX" in e) && ("changedTouches" in e)) {
                                    e.clientX = e.changedTouches[0].clientX;
                                    e.clientY = e.changedTouches[0].clientY;
                                }

                                if (self.forcescreen) {
                                    var le = e;
                                    var e = {
                                        "original": (e.original) ? e.original : e
                                    };
                                    e.clientX = le.screenX;
                                    e.clientY = le.screenY;
                                }

                                self.rail.drag = {
                                    x: e.clientX,
                                    y: e.clientY,
                                    sx: self.scroll.x,
                                    sy: self.scroll.y,
                                    st: self.getScrollTop(),
                                    sl: self.getScrollLeft(),
                                    pt: 2,
                                    dl: false
                                };

                                if (self.ispage || !self.opt.directionlockdeadzone) {
                                    self.rail.drag.dl = "f";
                                } else {

                                    var view = {
                                        w: $(window).width(),
                                        h: $(window).height()
                                    };

                                    var page = {
                                        w: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
                                        h: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
                                    };

                                    var maxh = Math.max(0, page.h - view.h);
                                    var maxw = Math.max(0, page.w - view.w);

                                    if (!self.rail.scrollable && self.railh.scrollable) self.rail.drag.ck = (maxh > 0) ? "v" : false;
                                    else if (self.rail.scrollable && !self.railh.scrollable) self.rail.drag.ck = (maxw > 0) ? "h" : false;
                                    else self.rail.drag.ck = false;
                                    if (!self.rail.drag.ck) self.rail.drag.dl = "f";
                                }

                                if (self.opt.touchbehavior && self.isiframe && cap.isie) {
                                    var wp = self.win.position();
                                    self.rail.drag.x += wp.left;
                                    self.rail.drag.y += wp.top;
                                }

                                self.hasmoving = false;
                                self.lastmouseup = false;
                                self.scrollmom.reset(e.clientX, e.clientY);
                                if (!cap.cantouch && !this.istouchcapable && !cap.hasmstouch) {

                                    var ip = (tg) ? /INPUT|SELECT|TEXTAREA/i.test(tg.nodeName) : false;
                                    if (!ip) {
                                        if (!self.ispage && cap.hasmousecapture) tg.setCapture();

                                        if (self.opt.touchbehavior) {
                                            if (tg.onclick && !(tg._onclick || false)) { // intercept DOM0 onclick event
                                                tg._onclick = tg.onclick;
                                                tg.onclick = function(e) {
                                                    if (self.hasmoving) return false;
                                                    tg._onclick.call(this, e);
                                                }
                                            }
                                            return self.cancelEvent(e);
                                        }

                                        return self.stopPropagation(e);
                                    }

                                    if (/SUBMIT|CANCEL|BUTTON/i.test($(tg).attr('type'))) {
                                        pc = {
                                            "tg": tg,
                                            "click": false
                                        };
                                        self.preventclick = pc;
                                    }

                                }
                            }

                        };

                        self.ontouchend = function(e) {
                            if (e.pointerType && e.pointerType != 2) return false;
                            if (self.rail.drag && (self.rail.drag.pt == 2)) {
                                self.scrollmom.doMomentum();
                                self.rail.drag = false;
                                if (self.hasmoving) {
                                    self.lastmouseup = true;
                                    self.hideCursor();
                                    if (cap.hasmousecapture) document.releaseCapture();
                                    if (!cap.cantouch) return self.cancelEvent(e);
                                }
                            }

                        };

                        var moveneedoffset = (self.opt.touchbehavior && self.isiframe && !cap.hasmousecapture);

                        self.ontouchmove = function(e, byiframe) {

                            if (e.pointerType && e.pointerType != 2) return false;

                            if (self.rail.drag && (self.rail.drag.pt == 2)) {
                                if (cap.cantouch && (typeof e.original == "undefined")) return true; // prevent ios "ghost" events by clickable elements

                                self.hasmoving = true;

                                if (self.preventclick && !self.preventclick.click) {
                                    self.preventclick.click = self.preventclick.tg.onclick || false;
                                    self.preventclick.tg.onclick = self.onpreventclick;
                                }

                                var ev = $.extend({
                                    "original": e
                                }, e);
                                e = ev;

                                if (("changedTouches" in e)) {
                                    e.clientX = e.changedTouches[0].clientX;
                                    e.clientY = e.changedTouches[0].clientY;
                                }

                                if (self.forcescreen) {
                                    var le = e;
                                    var e = {
                                        "original": (e.original) ? e.original : e
                                    };
                                    e.clientX = le.screenX;
                                    e.clientY = le.screenY;
                                }

                                var ofx = ofy = 0;

                                if (moveneedoffset && !byiframe) {
                                    var wp = self.win.position();
                                    ofx = -wp.left;
                                    ofy = -wp.top;
                                }

                                var fy = e.clientY + ofy;
                                var my = (fy - self.rail.drag.y);
                                var fx = e.clientX + ofx;
                                var mx = (fx - self.rail.drag.x);

                                var ny = self.rail.drag.st - my;

                                if (self.ishwscroll && self.opt.bouncescroll) {
                                    if (ny < 0) {
                                        ny = Math.round(ny / 2);
                                        //                    fy = 0;
                                    } else if (ny > self.page.maxh) {
                                        ny = self.page.maxh + Math.round((ny - self.page.maxh) / 2);
                                        //                    fy = 0;
                                    }
                                } else {
                                    if (ny < 0) {
                                        ny = 0;
                                        fy = 0
                                    }
                                    if (ny > self.page.maxh) {
                                        ny = self.page.maxh;
                                        fy = 0
                                    }
                                }

                                if (self.railh && self.railh.scrollable) {
                                    var nx = self.rail.drag.sl - mx;; //(self.isrtlmode) ? mx-self.rail.drag.sl : self.rail.drag.sl-mx;

                                    if (self.ishwscroll && self.opt.bouncescroll) {
                                        if (nx < 0) {
                                            nx = Math.round(nx / 2);
                                            //                      fx = 0;
                                        } else if (nx > self.page.maxw) {
                                            nx = self.page.maxw + Math.round((nx - self.page.maxw) / 2);
                                            //                      fx = 0;
                                        }
                                    } else {
                                        if (nx < 0) {
                                            nx = 0;
                                            fx = 0
                                        }
                                        if (nx > self.page.maxw) {
                                            nx = self.page.maxw;
                                            fx = 0
                                        }
                                    }

                                }

                                var grabbed = false;
                                if (self.rail.drag.dl) {
                                    grabbed = true;
                                    if (self.rail.drag.dl == "v") nx = self.rail.drag.sl;
                                    else if (self.rail.drag.dl == "h") ny = self.rail.drag.st;
                                } else {
                                    var ay = Math.abs(my);
                                    var ax = Math.abs(mx);
                                    var dz = self.opt.directionlockdeadzone;
                                    if (self.rail.drag.ck == "v") {
                                        if (ay > dz && (ax <= (ay * 0.3))) {
                                            self.rail.drag = false;
                                            return true;
                                        } else if (ax > dz) {
                                            self.rail.drag.dl = "f";
                                            $("body").scrollTop($("body").scrollTop()); // stop iOS native scrolling (when active javascript has blocked)
                                        }
                                    } else if (self.rail.drag.ck == "h") {
                                        if (ax > dz && (ay <= (ax * 0.3))) {
                                            self.rail.drag = false;
                                            return true;
                                        } else if (ay > dz) {
                                            self.rail.drag.dl = "f";
                                            $("body").scrollLeft($("body").scrollLeft()); // stop iOS native scrolling (when active javascript has blocked)
                                        }
                                    }
                                }

                                self.synched("touchmove", function() {
                                    if (self.rail.drag && (self.rail.drag.pt == 2)) {
                                        if (self.prepareTransition) self.prepareTransition(0);
                                        if (self.rail.scrollable) self.setScrollTop(ny);
                                        self.scrollmom.update(fx, fy);
                                        if (self.railh && self.railh.scrollable) {
                                            self.setScrollLeft(nx);
                                            self.showCursor(ny, nx);
                                        } else {
                                            self.showCursor(ny);
                                        }
                                        if (cap.isie10) document.selection.clear();
                                    }
                                });

                                if (cap.ischrome && self.istouchcapable) grabbed = false; //chrome touch emulation doesn't like!
                                if (grabbed) return self.cancelEvent(e);
                            }

                        };

                    }

                    self.onmousedown = function(e, hronly) {
                        if (self.rail.drag && self.rail.drag.pt != 1) return;
                        if (self.locked) return self.cancelEvent(e);
                        self.cancelScroll();
                        self.rail.drag = {
                            x: e.clientX,
                            y: e.clientY,
                            sx: self.scroll.x,
                            sy: self.scroll.y,
                            pt: 1,
                            hr: ( !! hronly)
                        };
                        var tg = self.getTarget(e);
                        if (!self.ispage && cap.hasmousecapture) tg.setCapture();
                        if (self.isiframe && !cap.hasmousecapture) {
                            self.saved["csspointerevents"] = self.doc.css("pointer-events");
                            self.css(self.doc, {
                                "pointer-events": "none"
                            });
                        }
                        self.hasmoving = false;
                        return self.cancelEvent(e);
                    };

                    self.onmouseup = function(e) {
                        if (self.rail.drag) {
                            if (cap.hasmousecapture) document.releaseCapture();
                            if (self.isiframe && !cap.hasmousecapture) self.doc.css("pointer-events", self.saved["csspointerevents"]);
                            if (self.rail.drag.pt != 1) return;
                            self.rail.drag = false;
                            //if (!self.rail.active) self.hideCursor();
                            if (self.hasmoving) self.triggerScrollEnd(); // TODO - check &&!self.scrollrunning
                            return self.cancelEvent(e);
                        }
                    };

                    self.onmousemove = function(e) {
                        if (self.rail.drag) {
                            if (self.rail.drag.pt != 1) return;

                            if (cap.ischrome && e.which == 0) return self.onmouseup(e);

                            self.cursorfreezed = true;
                            self.hasmoving = true;

                            if (self.rail.drag.hr) {
                                self.scroll.x = self.rail.drag.sx + (e.clientX - self.rail.drag.x);
                                if (self.scroll.x < 0) self.scroll.x = 0;
                                var mw = self.scrollvaluemaxw;
                                if (self.scroll.x > mw) self.scroll.x = mw;
                            } else {
                                self.scroll.y = self.rail.drag.sy + (e.clientY - self.rail.drag.y);
                                if (self.scroll.y < 0) self.scroll.y = 0;
                                var my = self.scrollvaluemax;
                                if (self.scroll.y > my) self.scroll.y = my;
                            }

                            self.synched('mousemove', function() {
                                if (self.rail.drag && (self.rail.drag.pt == 1)) {
                                    self.showCursor();
                                    if (self.rail.drag.hr) self.doScrollLeft(Math.round(self.scroll.x * self.scrollratio.x), self.opt.cursordragspeed);
                                    else self.doScrollTop(Math.round(self.scroll.y * self.scrollratio.y), self.opt.cursordragspeed);
                                }
                            });

                            return self.cancelEvent(e);
                        }
                        /*              
            else {
              self.checkarea = true;
            }
*/
                    };

                    if (cap.cantouch || self.opt.touchbehavior) {

                        self.onpreventclick = function(e) {
                            if (self.preventclick) {
                                self.preventclick.tg.onclick = self.preventclick.click;
                                self.preventclick = false;
                                return self.cancelEvent(e);
                            }
                        }

                        //            self.onmousedown = self.ontouchstart;            
                        //            self.onmouseup = self.ontouchend;
                        //            self.onmousemove = self.ontouchmove;

                        self.bind(self.win, "mousedown", self.ontouchstart); // control content dragging

                        self.onclick = (cap.isios) ? false : function(e) {
                            if (self.lastmouseup) {
                                self.lastmouseup = false;
                                return self.cancelEvent(e);
                            } else {
                                return true;
                            }
                        };

                        if (self.opt.grabcursorenabled && cap.cursorgrabvalue) {
                            self.css((self.ispage) ? self.doc : self.win, {
                                'cursor': cap.cursorgrabvalue
                            });
                            self.css(self.rail, {
                                'cursor': cap.cursorgrabvalue
                            });
                        }

                    } else {

                        function checkSelectionScroll(e) {
                            if (!self.selectiondrag) return;

                            if (e) {
                                var ww = self.win.outerHeight();
                                var df = (e.pageY - self.selectiondrag.top);
                                if (df > 0 && df < ww) df = 0;
                                if (df >= ww) df -= ww;
                                self.selectiondrag.df = df;
                            }
                            if (self.selectiondrag.df == 0) return;

                            var rt = -Math.floor(self.selectiondrag.df / 6) * 2;
                            //              self.doScrollTop(self.getScrollTop(true)+rt);
                            self.doScrollBy(rt);

                            self.debounced("doselectionscroll", function() {
                                checkSelectionScroll()
                            }, 50);
                        };

                        if ("getSelection" in document) { // A grade - Major browsers
                            self.hasTextSelected = function() {
                                return (document.getSelection().rangeCount > 0);
                            };
                        } else if ("selection" in document) { //IE9-
                            self.hasTextSelected = function() {
                                return (document.selection.type != "None");
                            };
                        } else {
                            self.hasTextSelected = function() { // no support
                                return false;
                            };
                        }

                        self.onselectionstart = function(e) {
                            if (self.ispage) return;
                            self.selectiondrag = self.win.offset();
                        };
                        self.onselectionend = function(e) {
                            self.selectiondrag = false;
                        };
                        self.onselectiondrag = function(e) {
                            if (!self.selectiondrag) return;
                            if (self.hasTextSelected()) self.debounced("selectionscroll", function() {
                                checkSelectionScroll(e)
                            }, 250);
                        };


                    }

                    if (cap.hasmstouch) {
                        self.css(self.rail, {
                            '-ms-touch-action': 'none'
                        });
                        self.css(self.cursor, {
                            '-ms-touch-action': 'none'
                        });

                        self.bind(self.win, "MSPointerDown", self.ontouchstart);
                        self.bind(document, "MSPointerUp", self.ontouchend);
                        self.bind(document, "MSPointerMove", self.ontouchmove);
                        self.bind(self.cursor, "MSGestureHold", function(e) {
                            e.preventDefault()
                        });
                        self.bind(self.cursor, "contextmenu", function(e) {
                            e.preventDefault()
                        });
                    }

                    if (this.istouchcapable) { //desktop with screen touch enabled
                        self.bind(self.win, "touchstart", self.ontouchstart);
                        self.bind(document, "touchend", self.ontouchend);
                        self.bind(document, "touchcancel", self.ontouchend);
                        self.bind(document, "touchmove", self.ontouchmove);
                    }

                    self.bind(self.cursor, "mousedown", self.onmousedown);
                    self.bind(self.cursor, "mouseup", self.onmouseup);

                    if (self.railh) {
                        self.bind(self.cursorh, "mousedown", function(e) {
                            self.onmousedown(e, true)
                        });

                        self.bind(self.cursorh, "mouseup", self.onmouseup);


                        /*						
            self.bind(self.cursorh,"mouseup",function(e){
              if (self.rail.drag&&self.rail.drag.pt==2) return;
              self.rail.drag = false;
              self.hasmoving = false;
              self.hideCursor();
              if (cap.hasmousecapture) document.releaseCapture();
              return self.cancelEvent(e);
            });
*/

                    }

                    if (self.opt.cursordragontouch || !cap.cantouch && !self.opt.touchbehavior) {

                        self.rail.css({
                            "cursor": "default"
                        });
                        self.railh && self.railh.css({
                            "cursor": "default"
                        });

                        self.jqbind(self.rail, "mouseenter", function() {
                            if (!self.win.is(":visible")) return false;
                            if (self.canshowonmouseevent) self.showCursor();
                            self.rail.active = true;
                        });
                        self.jqbind(self.rail, "mouseleave", function() {
                            self.rail.active = false;
                            if (!self.rail.drag) self.hideCursor();
                        });

                        if (self.opt.sensitiverail) {
                            self.bind(self.rail, "click", function(e) {
                                self.doRailClick(e, false, false)
                            });
                            self.bind(self.rail, "dblclick", function(e) {
                                self.doRailClick(e, true, false)
                            });
                            self.bind(self.cursor, "click", function(e) {
                                self.cancelEvent(e)
                            });
                            self.bind(self.cursor, "dblclick", function(e) {
                                self.cancelEvent(e)
                            });
                        }

                        if (self.railh) {
                            self.jqbind(self.railh, "mouseenter", function() {
                                if (!self.win.is(":visible")) return false;
                                if (self.canshowonmouseevent) self.showCursor();
                                self.rail.active = true;
                            });
                            self.jqbind(self.railh, "mouseleave", function() {
                                self.rail.active = false;
                                if (!self.rail.drag) self.hideCursor();
                            });

                            if (self.opt.sensitiverail) {
                                self.bind(self.railh, "click", function(e) {
                                    self.doRailClick(e, false, true)
                                });
                                self.bind(self.railh, "dblclick", function(e) {
                                    self.doRailClick(e, true, true)
                                });
                                self.bind(self.cursorh, "click", function(e) {
                                    self.cancelEvent(e)
                                });
                                self.bind(self.cursorh, "dblclick", function(e) {
                                    self.cancelEvent(e)
                                });
                            }

                        }

                    }

                    if (!cap.cantouch && !self.opt.touchbehavior) {

                        self.bind((cap.hasmousecapture) ? self.win : document, "mouseup", self.onmouseup);
                        self.bind(document, "mousemove", self.onmousemove);
                        if (self.onclick) self.bind(document, "click", self.onclick);

                        if (!self.ispage && self.opt.enablescrollonselection) {
                            self.bind(self.win[0], "mousedown", self.onselectionstart);
                            self.bind(document, "mouseup", self.onselectionend);
                            self.bind(self.cursor, "mouseup", self.onselectionend);
                            if (self.cursorh) self.bind(self.cursorh, "mouseup", self.onselectionend);
                            self.bind(document, "mousemove", self.onselectiondrag);
                        }

                        if (self.zoom) {
                            self.jqbind(self.zoom, "mouseenter", function() {
                                if (self.canshowonmouseevent) self.showCursor();
                                self.rail.active = true;
                            });
                            self.jqbind(self.zoom, "mouseleave", function() {
                                self.rail.active = false;
                                if (!self.rail.drag) self.hideCursor();
                            });
                        }

                    } else {

                        self.bind((cap.hasmousecapture) ? self.win : document, "mouseup", self.ontouchend);
                        self.bind(document, "mousemove", self.ontouchmove);
                        if (self.onclick) self.bind(document, "click", self.onclick);

                        if (self.opt.cursordragontouch) {
                            self.bind(self.cursor, "mousedown", self.onmousedown);
                            self.bind(self.cursor, "mousemove", self.onmousemove);
                            self.cursorh && self.bind(self.cursorh, "mousedown", function(e) {
                                self.onmousedown(e, true)
                            });
                            self.cursorh && self.bind(self.cursorh, "mousemove", self.onmousemove);
                        }

                    }

                    if (self.opt.enablemousewheel) {
                        if (!self.isiframe) self.bind((cap.isie && self.ispage) ? document : self.win /*self.docscroll*/ , "mousewheel", self.onmousewheel);
                        self.bind(self.rail, "mousewheel", self.onmousewheel);
                        if (self.railh) self.bind(self.railh, "mousewheel", self.onmousewheelhr);
                    }

                    if (!self.ispage && !cap.cantouch && !(/HTML|^BODY/.test(self.win[0].nodeName))) {
                        if (!self.win.attr("tabindex")) self.win.attr({
                            "tabindex": tabindexcounter++
                        });

                        self.jqbind(self.win, "focus", function(e) {
                            domfocus = (self.getTarget(e)).id || true;
                            self.hasfocus = true;
                            if (self.canshowonmouseevent) self.noticeCursor();
                        });
                        self.jqbind(self.win, "blur", function(e) {
                            domfocus = false;
                            self.hasfocus = false;
                        });

                        self.jqbind(self.win, "mouseenter", function(e) {
                            mousefocus = (self.getTarget(e)).id || true;
                            self.hasmousefocus = true;
                            if (self.canshowonmouseevent) self.noticeCursor();
                        });
                        self.jqbind(self.win, "mouseleave", function() {
                            mousefocus = false;
                            self.hasmousefocus = false;
                            if (!self.rail.drag) self.hideCursor();
                        });

                    };

                } // !ie9mobile

                //Thanks to http://www.quirksmode.org !!
                self.onkeypress = function(e) {
                    if (self.locked && self.page.maxh == 0) return true;

                    e = (e) ? e : window.e;
                    var tg = self.getTarget(e);
                    if (tg && /INPUT|TEXTAREA|SELECT|OPTION/.test(tg.nodeName)) {
                        var tp = tg.getAttribute('type') || tg.type || false;
                        if ((!tp) || !(/submit|button|cancel/i.tp)) return true;
                    }

                    if ($(tg).attr('contenteditable')) return true;

                    if (self.hasfocus || (self.hasmousefocus && !domfocus) || (self.ispage && !domfocus && !mousefocus)) {
                        var key = e.keyCode;

                        if (self.locked && key != 27) return self.cancelEvent(e);

                        var ctrl = e.ctrlKey || false;
                        var shift = e.shiftKey || false;

                        var ret = false;
                        switch (key) {
                            case 38:
                            case 63233: //safari
                                self.doScrollBy(24 * 3);
                                ret = true;
                                break;
                            case 40:
                            case 63235: //safari
                                self.doScrollBy(-24 * 3);
                                ret = true;
                                break;
                            case 37:
                            case 63232: //safari
                                if (self.railh) {
                                    (ctrl) ? self.doScrollLeft(0) : self.doScrollLeftBy(24 * 3);
                                    ret = true;
                                }
                                break;
                            case 39:
                            case 63234: //safari
                                if (self.railh) {
                                    (ctrl) ? self.doScrollLeft(self.page.maxw) : self.doScrollLeftBy(-24 * 3);
                                    ret = true;
                                }
                                break;
                            case 33:
                            case 63276: // safari
                                self.doScrollBy(self.view.h);
                                ret = true;
                                break;
                            case 34:
                            case 63277: // safari
                                self.doScrollBy(-self.view.h);
                                ret = true;
                                break;
                            case 36:
                            case 63273: // safari                
                                (self.railh && ctrl) ? self.doScrollPos(0, 0) : self.doScrollTo(0);
                                ret = true;
                                break;
                            case 35:
                            case 63275: // safari
                                (self.railh && ctrl) ? self.doScrollPos(self.page.maxw, self.page.maxh) : self.doScrollTo(self.page.maxh);
                                ret = true;
                                break;
                            case 32:
                                if (self.opt.spacebarenabled) {
                                    (shift) ? self.doScrollBy(self.view.h) : self.doScrollBy(-self.view.h);
                                    ret = true;
                                }
                                break;
                            case 27: // ESC
                                if (self.zoomactive) {
                                    self.doZoom();
                                    ret = true;
                                }
                                break;
                        }
                        if (ret) return self.cancelEvent(e);
                    }
                };

                if (self.opt.enablekeyboard) self.bind(document, (cap.isopera && !cap.isopera12) ? "keypress" : "keydown", self.onkeypress);

                self.bind(document, "keydown", function(e) {
                    var ctrl = e.ctrlKey || false;
                    if (ctrl) self.wheelprevented = true;
                });
                self.bind(document, "keyup", function(e) {
                    var ctrl = e.ctrlKey || false;
                    if (!ctrl) self.wheelprevented = false;
                });

                self.bind(window, 'resize', self.lazyResize);
                self.bind(window, 'orientationchange', self.lazyResize);

                self.bind(window, "load", self.lazyResize);

                if (cap.ischrome && !self.ispage && !self.haswrapper) { //chrome void scrollbar bug - it persists in version 26
                    var tmp = self.win.attr("style");
                    var ww = parseFloat(self.win.css("width")) + 1;
                    self.win.css('width', ww);
                    self.synched("chromefix", function() {
                        self.win.attr("style", tmp)
                    });
                }


                // Trying a cross-browser implementation - good luck!

                self.onAttributeChange = function(e) {
                    self.lazyResize(250);
                };

                if (!self.ispage && !self.haswrapper) {
                    // redesigned MutationObserver for Chrome18+/Firefox14+/iOS6+ with support for: remove div, add/remove content
                    if (clsMutationObserver !== false) {
                        self.observer = new clsMutationObserver(function(mutations) {
                            mutations.forEach(self.onAttributeChange);
                        });
                        self.observer.observe(self.win[0], {
                            childList: true,
                            characterData: false,
                            attributes: true,
                            subtree: false
                        });

                        self.observerremover = new clsMutationObserver(function(mutations) {
                            mutations.forEach(function(mo) {
                                if (mo.removedNodes.length > 0) {
                                    for (var dd in mo.removedNodes) {
                                        if (mo.removedNodes[dd] == self.win[0]) return self.remove();
                                    }
                                }
                            });
                        });
                        self.observerremover.observe(self.win[0].parentNode, {
                            childList: true,
                            characterData: false,
                            attributes: false,
                            subtree: false
                        });

                    } else {
                        self.bind(self.win, (cap.isie && !cap.isie9) ? "propertychange" : "DOMAttrModified", self.onAttributeChange);
                        if (cap.isie9) self.win[0].attachEvent("onpropertychange", self.onAttributeChange); //IE9 DOMAttrModified bug
                        self.bind(self.win, "DOMNodeRemoved", function(e) {
                            if (e.target == self.win[0]) self.remove();
                        });
                    }
                }

                //

                if (!self.ispage && self.opt.boxzoom) self.bind(window, "resize", self.resizeZoom);
                if (self.istextarea) self.bind(self.win, "mouseup", self.lazyResize);

                //        self.checkrtlmode = true;
                self.lazyResize(30);

            }

            if (this.doc[0].nodeName == 'IFRAME') {
                function oniframeload(e) {
                    self.iframexd = false;
                    try {
                        var doc = 'contentDocument' in this ? this.contentDocument : this.contentWindow.document;
                        var a = doc.domain;
                    } catch (e) {
                        self.iframexd = true;
                        doc = false
                    };

                    if (self.iframexd) {
                        if ("console" in window) console.log('NiceScroll error: policy restriced iframe');
                        return true; //cross-domain - I can't manage this        
                    }

                    self.forcescreen = true;

                    if (self.isiframe) {
                        self.iframe = {
                            "doc": $(doc),
                            "html": self.doc.contents().find('html')[0],
                            "body": self.doc.contents().find('body')[0]
                        };
                        self.getContentSize = function() {
                            return {
                                w: Math.max(self.iframe.html.scrollWidth, self.iframe.body.scrollWidth),
                                h: Math.max(self.iframe.html.scrollHeight, self.iframe.body.scrollHeight)
                            };
                        };
                        self.docscroll = $(self.iframe.body); //$(this.contentWindow);
                    }

                    if (!cap.isios && self.opt.iframeautoresize && !self.isiframe) {
                        self.win.scrollTop(0); // reset position
                        self.doc.height(""); //reset height to fix browser bug
                        var hh = Math.max(doc.getElementsByTagName('html')[0].scrollHeight, doc.body.scrollHeight);
                        self.doc.height(hh);
                    }
                    self.lazyResize(30);

                    if (cap.isie7) self.css($(self.iframe.html), {
                        'overflow-y': 'hidden'
                    });
                    //self.css($(doc.body),{'overflow-y':'hidden'});
                    self.css($(self.iframe.body), {
                        'overflow-y': 'hidden'
                    });

                    if (cap.isios && self.haswrapper) {
                        self.css($(doc.body), {
                            '-webkit-transform': 'translate3d(0,0,0)'
                        }); // avoid iFrame content clipping - thanks to http://blog.derraab.com/2012/04/02/avoid-iframe-content-clipping-with-css-transform-on-ios/
                    }

                    if ('contentWindow' in this) {
                        self.bind(this.contentWindow, "scroll", self.onscroll); //IE8 & minor
                    } else {
                        self.bind(doc, "scroll", self.onscroll);
                    }

                    if (self.opt.enablemousewheel) {
                        self.bind(doc, "mousewheel", self.onmousewheel);
                    }

                    if (self.opt.enablekeyboard) self.bind(doc, (cap.isopera) ? "keypress" : "keydown", self.onkeypress);

                    if (cap.cantouch || self.opt.touchbehavior) {
                        self.bind(doc, "mousedown", self.ontouchstart);
                        self.bind(doc, "mousemove", function(e) {
                            self.ontouchmove(e, true)
                        });
                        if (self.opt.grabcursorenabled && cap.cursorgrabvalue) self.css($(doc.body), {
                            'cursor': cap.cursorgrabvalue
                        });
                    }

                    self.bind(doc, "mouseup", self.ontouchend);

                    if (self.zoom) {
                        if (self.opt.dblclickzoom) self.bind(doc, 'dblclick', self.doZoom);
                        if (self.ongesturezoom) self.bind(doc, "gestureend", self.ongesturezoom);
                    }
                };

                if (this.doc[0].readyState && this.doc[0].readyState == "complete") {
                    setTimeout(function() {
                        oniframeload.call(self.doc[0], false)
                    }, 500);
                }
                self.bind(this.doc, "load", oniframeload);

            }

        };

        this.showCursor = function(py, px) {
            if (self.cursortimeout) {
                clearTimeout(self.cursortimeout);
                self.cursortimeout = 0;
            }
            if (!self.rail) return;
            if (self.autohidedom) {
                self.autohidedom.stop().css({
                    opacity: self.opt.cursoropacitymax
                });
                self.cursoractive = true;
            }

            if (!self.rail.drag || self.rail.drag.pt != 1) {
                if ((typeof py != "undefined") && (py !== false)) {
                    self.scroll.y = Math.round(py * 1 / self.scrollratio.y);
                }
                if (typeof px != "undefined") {
                    self.scroll.x = Math.round(px * 1 / self.scrollratio.x); //-cxscrollleft * Math.round(px * 1/self.scrollratio.x);
                }
            }

            self.cursor.css({
                height: self.cursorheight,
                top: self.scroll.y
            });
            if (self.cursorh) {
                (!self.rail.align && self.rail.visibility) ? self.cursorh.css({
                    width: self.cursorwidth,
                    left: self.scroll.x + self.rail.width
                }) : self.cursorh.css({
                    width: self.cursorwidth,
                    left: self.scroll.x
                });
                self.cursoractive = true;
            }

            if (self.zoom) self.zoom.stop().css({
                opacity: self.opt.cursoropacitymax
            });
        };

        this.hideCursor = function(tm) {
            if (self.cursortimeout) return;
            if (!self.rail) return;
            if (!self.autohidedom) return;
            if (self.hasmousefocus && self.opt.autohidemode == "leave") return;
            self.cursortimeout = setTimeout(function() {
                if (!self.rail.active || !self.showonmouseevent) {
                    self.autohidedom.stop().animate({
                        opacity: self.opt.cursoropacitymin
                    });
                    if (self.zoom) self.zoom.stop().animate({
                        opacity: self.opt.cursoropacitymin
                    });
                    self.cursoractive = false;
                }
                self.cursortimeout = 0;
            }, tm || self.opt.hidecursordelay);
        };

        this.noticeCursor = function(tm, py, px) {
            self.showCursor(py, px);
            if (!self.rail.active) self.hideCursor(tm);
        };

        this.getContentSize =
            (self.ispage) ?
            function() {
                return {
                    w: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
                    h: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
                }
        } : (self.haswrapper) ?
            function() {
                return {
                    w: self.doc.outerWidth() + parseInt(self.win.css('paddingLeft')) + parseInt(self.win.css('paddingRight')),
                    h: self.doc.outerHeight() + parseInt(self.win.css('paddingTop')) + parseInt(self.win.css('paddingBottom'))
                }
        } : function() {
            return {
                w: self.docscroll[0].scrollWidth,
                h: self.docscroll[0].scrollHeight
            }
        };

        this.onResize = function(e, page) {

            if (!self || !self.win) return false;

            if (!self.haswrapper && !self.ispage) {
                if (self.win.css('display') == 'none') {
                    if (self.visibility) self.hideRail().hideRailHr();
                    return false;
                } else {
                    if (!self.hidden && !self.visibility) self.showRail().showRailHr();
                }
            }

            var premaxh = self.page.maxh;
            var premaxw = self.page.maxw;

            var preview = {
                h: self.view.h,
                w: self.view.w
            };

            self.view = {
                w: (self.ispage) ? self.win.width() : parseInt(self.win[0].clientWidth),
                h: (self.ispage) ? self.win.height() : parseInt(self.win[0].clientHeight)
            };

            self.page = (page) ? page : self.getContentSize();

            self.page.maxh = Math.max(0, self.page.h - self.view.h);
            self.page.maxw = Math.max(0, self.page.w - self.view.w);

            if ((self.page.maxh == premaxh) && (self.page.maxw == premaxw) && (self.view.w == preview.w)) {
                // test position        
                if (!self.ispage) {
                    var pos = self.win.offset();
                    if (self.lastposition) {
                        var lst = self.lastposition;
                        if ((lst.top == pos.top) && (lst.left == pos.left)) return self; //nothing to do            
                    }
                    self.lastposition = pos;
                } else {
                    return self; //nothing to do
                }
            }

            if (self.page.maxh == 0) {
                self.hideRail();
                self.scrollvaluemax = 0;
                self.scroll.y = 0;
                self.scrollratio.y = 0;
                self.cursorheight = 0;
                self.setScrollTop(0);
                self.rail.scrollable = false;
            } else {
                self.rail.scrollable = true;
            }

            if (self.page.maxw == 0) {
                self.hideRailHr();
                self.scrollvaluemaxw = 0;
                self.scroll.x = 0;
                self.scrollratio.x = 0;
                self.cursorwidth = 0;
                self.setScrollLeft(0);
                self.railh.scrollable = false;
            } else {
                self.railh.scrollable = true;
            }

            self.locked = (self.page.maxh == 0) && (self.page.maxw == 0);
            if (self.locked) {
                if (!self.ispage) self.updateScrollBar(self.view);
                return false;
            }

            if (!self.hidden && !self.visibility) {
                self.showRail().showRailHr();
            } else if (!self.hidden && !self.railh.visibility) self.showRailHr();

            if (self.istextarea && self.win.css('resize') && self.win.css('resize') != 'none') self.view.h -= 20;

            self.cursorheight = Math.min(self.view.h, Math.round(self.view.h * (self.view.h / self.page.h)));
            self.cursorheight = (self.opt.cursorfixedheight) ? self.opt.cursorfixedheight : Math.max(self.opt.cursorminheight, self.cursorheight);

            self.cursorwidth = Math.min(self.view.w, Math.round(self.view.w * (self.view.w / self.page.w)));
            self.cursorwidth = (self.opt.cursorfixedheight) ? self.opt.cursorfixedheight : Math.max(self.opt.cursorminheight, self.cursorwidth);

            self.scrollvaluemax = self.view.h - self.cursorheight - self.cursor.hborder;

            if (self.railh) {
                self.railh.width = (self.page.maxh > 0) ? (self.view.w - self.rail.width) : self.view.w;
                self.scrollvaluemaxw = self.railh.width - self.cursorwidth - self.cursorh.wborder;
            }

            /*			
      if (self.checkrtlmode&&self.railh) {
        self.checkrtlmode = false;
        if (self.opt.rtlmode&&self.scroll.x==0) self.setScrollLeft(self.page.maxw);
      }
*/

            if (!self.ispage) self.updateScrollBar(self.view);

            self.scrollratio = {
                x: (self.page.maxw / self.scrollvaluemaxw),
                y: (self.page.maxh / self.scrollvaluemax)
            };

            var sy = self.getScrollTop();
            if (sy > self.page.maxh) {
                self.doScrollTop(self.page.maxh);
            } else {
                self.scroll.y = Math.round(self.getScrollTop() * (1 / self.scrollratio.y));
                self.scroll.x = Math.round(self.getScrollLeft() * (1 / self.scrollratio.x));
                if (self.cursoractive) self.noticeCursor();
            }

            if (self.scroll.y && (self.getScrollTop() == 0)) self.doScrollTo(Math.floor(self.scroll.y * self.scrollratio.y));

            return self;
        };

        this.resize = self.onResize;

        this.lazyResize = function(tm) { // event debounce
            tm = (isNaN(tm)) ? 30 : tm;
            self.delayed('resize', self.resize, tm);
            return self;
        };

        // modified by MDN https://developer.mozilla.org/en-US/docs/DOM/Mozilla_event_reference/wheel
        function _modernWheelEvent(dom, name, fn, bubble) {
            self._bind(dom, name, function(e) {
                var e = (e) ? e : window.event;
                var event = {
                    original: e,
                    target: e.target || e.srcElement,
                    type: "wheel",
                    deltaMode: e.type == "MozMousePixelScroll" ? 0 : 1,
                    deltaX: 0,
                    deltaZ: 0,
                    preventDefault: function() {
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                        return false;
                    },
                    stopImmediatePropagation: function() {
                        (e.stopImmediatePropagation) ? e.stopImmediatePropagation() : e.cancelBubble = true;
                    }
                };

                if (name == "mousewheel") {
                    event.deltaY = -1 / 40 * e.wheelDelta;
                    e.wheelDeltaX && (event.deltaX = -1 / 40 * e.wheelDeltaX);
                } else {
                    event.deltaY = e.detail;
                }

                return fn.call(dom, event);
            }, bubble);
        };

        this._bind = function(el, name, fn, bubble) { // primitive bind
            self.events.push({
                e: el,
                n: name,
                f: fn,
                b: bubble,
                q: false
            });
            if (el.addEventListener) {
                el.addEventListener(name, fn, bubble || false);
            } else if (el.attachEvent) {
                el.attachEvent("on" + name, fn);
            } else {
                el["on" + name] = fn;
            }
        };

        this.jqbind = function(dom, name, fn) { // use jquery bind for non-native events (mouseenter/mouseleave)
            self.events.push({
                e: dom,
                n: name,
                f: fn,
                q: true
            });
            $(dom).bind(name, fn);
        };

        this.bind = function(dom, name, fn, bubble) { // touch-oriented & fixing jquery bind
            var el = ("jquery" in dom) ? dom[0] : dom;

            if (name == 'mousewheel') {
                if ("onwheel" in self.win) {
                    self._bind(el, "wheel", fn, bubble || false);
                } else {
                    var wname = (typeof document.onmousewheel != "undefined") ? "mousewheel" : "DOMMouseScroll"; // older IE/Firefox
                    _modernWheelEvent(el, wname, fn, bubble || false);
                    if (wname == "DOMMouseScroll") _modernWheelEvent(el, "MozMousePixelScroll", fn, bubble || false); // Firefox legacy
                }
            } else if (el.addEventListener) {
                if (cap.cantouch && /mouseup|mousedown|mousemove/.test(name)) { // touch device support
                    var tt = (name == 'mousedown') ? 'touchstart' : (name == 'mouseup') ? 'touchend' : 'touchmove';
                    self._bind(el, tt, function(e) {
                        if (e.touches) {
                            if (e.touches.length < 2) {
                                var ev = (e.touches.length) ? e.touches[0] : e;
                                ev.original = e;
                                fn.call(this, ev);
                            }
                        } else if (e.changedTouches) {
                            var ev = e.changedTouches[0];
                            ev.original = e;
                            fn.call(this, ev);
                        } //blackberry
                    }, bubble || false);
                }
                self._bind(el, name, fn, bubble || false);
                if (cap.cantouch && name == "mouseup") self._bind(el, "touchcancel", fn, bubble || false);
            } else {
                self._bind(el, name, function(e) {
                    e = e || window.event || false;
                    if (e) {
                        if (e.srcElement) e.target = e.srcElement;
                    }
                    if (!("pageY" in e)) {
                        e.pageX = e.clientX + document.documentElement.scrollLeft;
                        e.pageY = e.clientY + document.documentElement.scrollTop;
                    }
                    return ((fn.call(el, e) === false) || bubble === false) ? self.cancelEvent(e) : true;
                });
            }
        };

        this._unbind = function(el, name, fn, bub) { // primitive unbind
            if (el.removeEventListener) {
                el.removeEventListener(name, fn, bub);
            } else if (el.detachEvent) {
                el.detachEvent('on' + name, fn);
            } else {
                el['on' + name] = false;
            }
        };

        this.unbindAll = function() {
            for (var a = 0; a < self.events.length; a++) {
                var r = self.events[a];
                (r.q) ? r.e.unbind(r.n, r.f) : self._unbind(r.e, r.n, r.f, r.b);
            }
        };

        // Thanks to http://www.switchonthecode.com !!
        this.cancelEvent = function(e) {
            var e = (e.original) ? e.original : (e) ? e : window.event || false;
            if (!e) return false;
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventManipulation) e.preventManipulation(); //IE10
            e.cancelBubble = true;
            e.cancel = true;
            e.returnValue = false;
            return false;
        };

        this.stopPropagation = function(e) {
            var e = (e.original) ? e.original : (e) ? e : window.event || false;
            if (!e) return false;
            if (e.stopPropagation) return e.stopPropagation();
            if (e.cancelBubble) e.cancelBubble = true;
            return false;
        };

        this.showRail = function() {
            if ((self.page.maxh != 0) && (self.ispage || self.win.css('display') != 'none')) {
                self.visibility = true;
                self.rail.visibility = true;
                self.rail.css('display', 'block');
            }
            return self;
        };

        this.showRailHr = function() {
            if (!self.railh) return self;
            if ((self.page.maxw != 0) && (self.ispage || self.win.css('display') != 'none')) {
                self.railh.visibility = true;
                self.railh.css('display', 'block');
            }
            return self;
        };

        this.hideRail = function() {
            self.visibility = false;
            self.rail.visibility = false;
            self.rail.css('display', 'none');
            return self;
        };

        this.hideRailHr = function() {
            if (!self.railh) return self;
            self.railh.visibility = false;
            self.railh.css('display', 'none');
            return self;
        };

        this.show = function() {
            self.hidden = false;
            self.locked = false;
            return self.showRail().showRailHr();
        };

        this.hide = function() {
            self.hidden = true;
            self.locked = true;
            return self.hideRail().hideRailHr();
        };

        this.toggle = function() {
            return (self.hidden) ? self.show() : self.hide();
        };

        this.remove = function() {
            self.stop();
            if (self.cursortimeout) clearTimeout(self.cursortimeout);
            self.doZoomOut();
            self.unbindAll();

            if (cap.isie9) self.win[0].detachEvent("onpropertychange", self.onAttributeChange); //IE9 DOMAttrModified bug

            if (self.observer !== false) self.observer.disconnect();
            if (self.observerremover !== false) self.observerremover.disconnect();

            self.events = null;

            if (self.cursor) {
                self.cursor.remove();
            }
            if (self.cursorh) {
                self.cursorh.remove();
            }
            if (self.rail) {
                self.rail.remove();
            }
            if (self.railh) {
                self.railh.remove();
            }
            if (self.zoom) {
                self.zoom.remove();
            }
            for (var a = 0; a < self.saved.css.length; a++) {
                var d = self.saved.css[a];
                d[0].css(d[1], (typeof d[2] == "undefined") ? '' : d[2]);
            }
            self.saved = false;
            self.me.data('__nicescroll', ''); //erase all traces

            // memory leak fixed by GianlucaGuarini - thanks a lot!
            // remove the current nicescroll from the $.nicescroll array & normalize array
            var lst = $.nicescroll;
            lst.each(function(i) {
                if (!this) return;
                if (this.id === self.id) {
                    delete lst[i];
                    for (var b = ++i; b < lst.length; b++, i++) lst[i] = lst[b];
                    lst.length--;
                    if (lst.length) delete lst[lst.length];
                }
            });

            for (var i in self) {
                self[i] = null;
                delete self[i];
            }

            self = null;

        };

        this.scrollstart = function(fn) {
            this.onscrollstart = fn;
            return self;
        };
        this.scrollend = function(fn) {
            this.onscrollend = fn;
            return self;
        };
        this.scrollcancel = function(fn) {
            this.onscrollcancel = fn;
            return self;
        };

        this.zoomin = function(fn) {
            this.onzoomin = fn;
            return self;
        };
        this.zoomout = function(fn) {
            this.onzoomout = fn;
            return self;
        };

        this.isScrollable = function(e) {
            var dom = (e.target) ? e.target : e;
            if (dom.nodeName == 'OPTION') return true;
            while (dom && (dom.nodeType == 1) && !(/^BODY|HTML/.test(dom.nodeName))) {
                var dd = $(dom);
                var ov = dd.css('overflowY') || dd.css('overflowX') || dd.css('overflow') || '';
                if (/scroll|auto/.test(ov)) return (dom.clientHeight != dom.scrollHeight);
                dom = (dom.parentNode) ? dom.parentNode : false;
            }
            return false;
        };

        this.getViewport = function(me) {
            var dom = (me && me.parentNode) ? me.parentNode : false;
            while (dom && (dom.nodeType == 1) && !(/^BODY|HTML/.test(dom.nodeName))) {
                var dd = $(dom);
                if (/fixed|absolute/.test(dd.css("position"))) return dd;
                var ov = dd.css('overflowY') || dd.css('overflowX') || dd.css('overflow') || '';
                if ((/scroll|auto/.test(ov)) && (dom.clientHeight != dom.scrollHeight)) return dd;
                if (dd.getNiceScroll().length > 0) return dd;
                dom = (dom.parentNode) ? dom.parentNode : false;
            }
            return (dom) ? $(dom) : false;
        };

        this.triggerScrollEnd = function() {
            if (!self.onscrollend) return;

            var px = self.getScrollLeft();
            var py = self.getScrollTop();

            var info = {
                "type": "scrollend",
                "current": {
                    "x": px,
                    "y": py
                },
                "end": {
                    "x": px,
                    "y": py
                }
            };
            self.onscrollend.call(self, info);
        }

        function execScrollWheel(e, hr, chkscroll) {
            var px, py;
            var rt = 1;

            if (e.deltaMode == 0) { // PIXEL
                px = -Math.floor(e.deltaX * (self.opt.mousescrollstep / (18 * 3)));
                py = -Math.floor(e.deltaY * (self.opt.mousescrollstep / (18 * 3)));
            } else if (e.deltaMode == 1) { // LINE
                px = -Math.floor(e.deltaX * self.opt.mousescrollstep);
                py = -Math.floor(e.deltaY * self.opt.mousescrollstep);
            }

            if (hr && self.opt.oneaxismousemode && (px == 0) && py) { // classic vertical-only mousewheel + browser with x/y support 
                px = py;
                py = 0;
            }

            if (px) {
                if (self.scrollmom) {
                    self.scrollmom.stop()
                }
                self.lastdeltax += px;
                self.debounced("mousewheelx", function() {
                    var dt = self.lastdeltax;
                    self.lastdeltax = 0;
                    if (!self.rail.drag) {
                        self.doScrollLeftBy(dt)
                    }
                }, 15);
            }
            if (py) {
                if (self.opt.nativeparentscrolling && chkscroll && !self.ispage && !self.zoomactive) {
                    if (py < 0) {
                        if (self.getScrollTop() >= self.page.maxh) return true;
                    } else {
                        if (self.getScrollTop() <= 0) return true;
                    }
                }
                if (self.scrollmom) {
                    self.scrollmom.stop()
                }
                self.lastdeltay += py;
                self.debounced("mousewheely", function() {
                    var dt = self.lastdeltay;
                    self.lastdeltay = 0;
                    if (!self.rail.drag) {
                        self.doScrollBy(dt)
                    }
                }, 15);
            }

            e.stopImmediatePropagation();
            return e.preventDefault();
            //      return self.cancelEvent(e);
        };

        this.onmousewheel = function(e) {
            if (self.wheelprevented) return;
            if (self.locked) {
                self.debounced("checkunlock", self.resize, 250);
                return true;
            }
            if (self.rail.drag) return self.cancelEvent(e);

            if (self.opt.oneaxismousemode == "auto" && e.deltaX != 0) self.opt.oneaxismousemode = false; // check two-axis mouse support (not very elegant)

            if (self.opt.oneaxismousemode && e.deltaX == 0) {
                if (!self.rail.scrollable) {
                    if (self.railh && self.railh.scrollable) {
                        return self.onmousewheelhr(e);
                    } else {
                        return true;
                    }
                }
            }

            var nw = +(new Date());
            var chk = false;
            if (self.opt.preservenativescrolling && ((self.checkarea + 600) < nw)) {
                //        self.checkarea = false;
                self.nativescrollingarea = self.isScrollable(e);
                chk = true;
            }
            self.checkarea = nw;
            if (self.nativescrollingarea) return true; // this isn't my business
            //      if (self.locked) return self.cancelEvent(e);
            var ret = execScrollWheel(e, false, chk);
            if (ret) self.checkarea = 0;
            return ret;
        };

        this.onmousewheelhr = function(e) {
            if (self.wheelprevented) return;
            if (self.locked || !self.railh.scrollable) return true;
            if (self.rail.drag) return self.cancelEvent(e);

            var nw = +(new Date());
            var chk = false;
            if (self.opt.preservenativescrolling && ((self.checkarea + 600) < nw)) {
                //        self.checkarea = false;
                self.nativescrollingarea = self.isScrollable(e);
                chk = true;
            }
            self.checkarea = nw;
            if (self.nativescrollingarea) return true; // this isn't my business
            if (self.locked) return self.cancelEvent(e);

            return execScrollWheel(e, true, chk);
        };

        this.stop = function() {
            self.cancelScroll();
            if (self.scrollmon) self.scrollmon.stop();
            self.cursorfreezed = false;
            self.scroll.y = Math.round(self.getScrollTop() * (1 / self.scrollratio.y));
            self.noticeCursor();
            return self;
        };

        this.getTransitionSpeed = function(dif) {
            var sp = Math.round(self.opt.scrollspeed * 10);
            var ex = Math.min(sp, Math.round((dif / 20) * self.opt.scrollspeed));
            return (ex > 20) ? ex : 0;
        };

        if (!self.opt.smoothscroll) {
            this.doScrollLeft = function(x, spd) { //direct
                var y = self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollTop = function(y, spd) { //direct
                var x = self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };
            this.doScrollPos = function(x, y, spd) { //direct
                var nx = (x > self.page.maxw) ? self.page.maxw : x;
                if (nx < 0) nx = 0;
                var ny = (y > self.page.maxh) ? self.page.maxh : y;
                if (ny < 0) ny = 0;
                self.synched('scroll', function() {
                    self.setScrollTop(ny);
                    self.setScrollLeft(nx);
                });
            };
            this.cancelScroll = function() {}; // direct
        } else if (self.ishwscroll && cap.hastransition && self.opt.usetransition) {
            this.prepareTransition = function(dif, istime) {
                var ex = (istime) ? ((dif > 20) ? dif : 0) : self.getTransitionSpeed(dif);
                var trans = (ex) ? cap.prefixstyle + 'transform ' + ex + 'ms ease-out' : '';
                if (!self.lasttransitionstyle || self.lasttransitionstyle != trans) {
                    self.lasttransitionstyle = trans;
                    self.doc.css(cap.transitionstyle, trans);
                }
                return ex;
            };

            this.doScrollLeft = function(x, spd) { //trans
                var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollTop = function(y, spd) { //trans
                var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollPos = function(x, y, spd) { //trans

                var py = self.getScrollTop();
                var px = self.getScrollLeft();

                if (((self.newscrolly - py) * (y - py) < 0) || ((self.newscrollx - px) * (x - px) < 0)) self.cancelScroll(); //inverted movement detection      

                if (self.opt.bouncescroll == false) {
                    if (y < 0) y = 0;
                    else if (y > self.page.maxh) y = self.page.maxh;
                    if (x < 0) x = 0;
                    else if (x > self.page.maxw) x = self.page.maxw;
                }

                if (self.scrollrunning && x == self.newscrollx && y == self.newscrolly) return false;

                self.newscrolly = y;
                self.newscrollx = x;

                self.newscrollspeed = spd || false;

                if (self.timer) return false;

                self.timer = setTimeout(function() {

                    var top = self.getScrollTop();
                    var lft = self.getScrollLeft();

                    var dst = {};
                    dst.x = x - lft;
                    dst.y = y - top;
                    dst.px = lft;
                    dst.py = top;

                    var dd = Math.round(Math.sqrt(Math.pow(dst.x, 2) + Math.pow(dst.y, 2)));

                    //          var df = (self.newscrollspeed) ? self.newscrollspeed : dd;

                    var ms = (self.newscrollspeed && self.newscrollspeed > 1) ? self.newscrollspeed : self.getTransitionSpeed(dd);
                    if (self.newscrollspeed && self.newscrollspeed <= 1) ms *= self.newscrollspeed;

                    self.prepareTransition(ms, true);

                    if (self.timerscroll && self.timerscroll.tm) clearInterval(self.timerscroll.tm);

                    if (ms > 0) {

                        if (!self.scrollrunning && self.onscrollstart) {
                            var info = {
                                "type": "scrollstart",
                                "current": {
                                    "x": lft,
                                    "y": top
                                },
                                "request": {
                                    "x": x,
                                    "y": y
                                },
                                "end": {
                                    "x": self.newscrollx,
                                    "y": self.newscrolly
                                },
                                "speed": ms
                            };
                            self.onscrollstart.call(self, info);
                        }

                        if (cap.transitionend) {
                            if (!self.scrollendtrapped) {
                                self.scrollendtrapped = true;
                                self.bind(self.doc, cap.transitionend, self.onScrollTransitionEnd, false); //I have got to do something usefull!!
                            }
                        } else {
                            if (self.scrollendtrapped) clearTimeout(self.scrollendtrapped);
                            self.scrollendtrapped = setTimeout(self.onScrollTransitionEnd, ms); // simulate transitionend event
                        }

                        var py = top;
                        var px = lft;
                        self.timerscroll = {
                            bz: new BezierClass(py, self.newscrolly, ms, 0, 0, 0.58, 1),
                            bh: new BezierClass(px, self.newscrollx, ms, 0, 0, 0.58, 1)
                        };
                        if (!self.cursorfreezed) self.timerscroll.tm = setInterval(function() {
                            self.showCursor(self.getScrollTop(), self.getScrollLeft())
                        }, 60);

                    }

                    self.synched("doScroll-set", function() {
                        self.timer = 0;
                        if (self.scrollendtrapped) self.scrollrunning = true;
                        self.setScrollTop(self.newscrolly);
                        self.setScrollLeft(self.newscrollx);
                        if (!self.scrollendtrapped) self.onScrollTransitionEnd();
                    });


                }, 50);

            };

            this.cancelScroll = function() {
                if (!self.scrollendtrapped) return true;
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                self.scrollrunning = false;
                if (!cap.transitionend) clearTimeout(cap.transitionend);
                self.scrollendtrapped = false;
                self._unbind(self.doc, cap.transitionend, self.onScrollTransitionEnd);
                self.prepareTransition(0);
                self.setScrollTop(py); // fire event onscroll
                if (self.railh) self.setScrollLeft(px);
                if (self.timerscroll && self.timerscroll.tm) clearInterval(self.timerscroll.tm);
                self.timerscroll = false;

                self.cursorfreezed = false;

                //self.noticeCursor(false,py,px);
                self.showCursor(py, px);
                return self;
            };
            this.onScrollTransitionEnd = function() {
                if (self.scrollendtrapped) self._unbind(self.doc, cap.transitionend, self.onScrollTransitionEnd);
                self.scrollendtrapped = false;
                self.prepareTransition(0);
                if (self.timerscroll && self.timerscroll.tm) clearInterval(self.timerscroll.tm);
                self.timerscroll = false;
                var py = self.getScrollTop();
                var px = self.getScrollLeft();
                self.setScrollTop(py); // fire event onscroll        
                if (self.railh) self.setScrollLeft(px); // fire event onscroll left

                self.noticeCursor(false, py, px);

                self.cursorfreezed = false;

                if (py < 0) py = 0
                else if (py > self.page.maxh) py = self.page.maxh;
                if (px < 0) px = 0
                else if (px > self.page.maxw) px = self.page.maxw;
                if ((py != self.newscrolly) || (px != self.newscrollx)) return self.doScrollPos(px, py, self.opt.snapbackspeed);

                if (self.onscrollend && self.scrollrunning) {
                    //          var info = {"type":"scrollend","current":{"x":px,"y":py},"end":{"x":self.newscrollx,"y":self.newscrolly}};
                    //          self.onscrollend.call(self,info);
                    self.triggerScrollEnd();
                }
                self.scrollrunning = false;

            };

        } else {

            this.doScrollLeft = function(x, spd) { //no-trans
                var y = (self.scrollrunning) ? self.newscrolly : self.getScrollTop();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollTop = function(y, spd) { //no-trans
                var x = (self.scrollrunning) ? self.newscrollx : self.getScrollLeft();
                self.doScrollPos(x, y, spd);
            };

            this.doScrollPos = function(x, y, spd) { //no-trans
                var y = ((typeof y == "undefined") || (y === false)) ? self.getScrollTop(true) : y;

                if ((self.timer) && (self.newscrolly == y) && (self.newscrollx == x)) return true;

                if (self.timer) clearAnimationFrame(self.timer);
                self.timer = 0;

                var py = self.getScrollTop();
                var px = self.getScrollLeft();

                if (((self.newscrolly - py) * (y - py) < 0) || ((self.newscrollx - px) * (x - px) < 0)) self.cancelScroll(); //inverted movement detection

                self.newscrolly = y;
                self.newscrollx = x;

                if (!self.bouncescroll || !self.rail.visibility) {
                    if (self.newscrolly < 0) {
                        self.newscrolly = 0;
                    } else if (self.newscrolly > self.page.maxh) {
                        self.newscrolly = self.page.maxh;
                    }
                }
                if (!self.bouncescroll || !self.railh.visibility) {
                    if (self.newscrollx < 0) {
                        self.newscrollx = 0;
                    } else if (self.newscrollx > self.page.maxw) {
                        self.newscrollx = self.page.maxw;
                    }
                }

                self.dst = {};
                self.dst.x = x - px;
                self.dst.y = y - py;
                self.dst.px = px;
                self.dst.py = py;

                var dst = Math.round(Math.sqrt(Math.pow(self.dst.x, 2) + Math.pow(self.dst.y, 2)));

                self.dst.ax = self.dst.x / dst;
                self.dst.ay = self.dst.y / dst;

                var pa = 0;
                var pe = dst;

                if (self.dst.x == 0) {
                    pa = py;
                    pe = y;
                    self.dst.ay = 1;
                    self.dst.py = 0;
                } else if (self.dst.y == 0) {
                    pa = px;
                    pe = x;
                    self.dst.ax = 1;
                    self.dst.px = 0;
                }

                var ms = self.getTransitionSpeed(dst);
                if (spd && spd <= 1) ms *= spd;
                if (ms > 0) {
                    self.bzscroll = (self.bzscroll) ? self.bzscroll.update(pe, ms) : new BezierClass(pa, pe, ms, 0, 1, 0, 1);
                } else {
                    self.bzscroll = false;
                }

                if (self.timer) return;

                if ((py == self.page.maxh && y >= self.page.maxh) || (px == self.page.maxw && x >= self.page.maxw)) self.checkContentSize();

                var sync = 1;

                function scrolling() {
                    if (self.cancelAnimationFrame) return true;

                    self.scrollrunning = true;

                    sync = 1 - sync;
                    if (sync) return (self.timer = setAnimationFrame(scrolling) || 1);

                    var done = 0;

                    var sc = sy = self.getScrollTop();
                    if (self.dst.ay) {
                        sc = (self.bzscroll) ? self.dst.py + (self.bzscroll.getNow() * self.dst.ay) : self.newscrolly;
                        var dr = sc - sy;
                        if ((dr < 0 && sc < self.newscrolly) || (dr > 0 && sc > self.newscrolly)) sc = self.newscrolly;
                        self.setScrollTop(sc);
                        if (sc == self.newscrolly) done = 1;
                    } else {
                        done = 1;
                    }

                    var scx = sx = self.getScrollLeft();
                    if (self.dst.ax) {
                        scx = (self.bzscroll) ? self.dst.px + (self.bzscroll.getNow() * self.dst.ax) : self.newscrollx;
                        var dr = scx - sx;
                        if ((dr < 0 && scx < self.newscrollx) || (dr > 0 && scx > self.newscrollx)) scx = self.newscrollx;
                        self.setScrollLeft(scx);
                        if (scx == self.newscrollx) done += 1;
                    } else {
                        done += 1;
                    }

                    if (done == 2) {
                        self.timer = 0;
                        self.cursorfreezed = false;
                        self.bzscroll = false;
                        self.scrollrunning = false;
                        if (sc < 0) sc = 0;
                        else if (sc > self.page.maxh) sc = self.page.maxh;
                        if (scx < 0) scx = 0;
                        else if (scx > self.page.maxw) scx = self.page.maxw;
                        if ((scx != self.newscrollx) || (sc != self.newscrolly)) self.doScrollPos(scx, sc);
                        else {
                            if (self.onscrollend) {
                                /*							
                var info = {"type":"scrollend","current":{"x":sx,"y":sy},"end":{"x":self.newscrollx,"y":self.newscrolly}};
                self.onscrollend.call(self,info);
*/
                                self.triggerScrollEnd();
                            }
                        }
                    } else {
                        self.timer = setAnimationFrame(scrolling) || 1;
                    }
                };
                self.cancelAnimationFrame = false;
                self.timer = 1;

                if (self.onscrollstart && !self.scrollrunning) {
                    var info = {
                        "type": "scrollstart",
                        "current": {
                            "x": px,
                            "y": py
                        },
                        "request": {
                            "x": x,
                            "y": y
                        },
                        "end": {
                            "x": self.newscrollx,
                            "y": self.newscrolly
                        },
                        "speed": ms
                    };
                    self.onscrollstart.call(self, info);
                }

                scrolling();

                if ((py == self.page.maxh && y >= py) || (px == self.page.maxw && x >= px)) self.checkContentSize();

                self.noticeCursor();
            };

            this.cancelScroll = function() {
                if (self.timer) clearAnimationFrame(self.timer);
                self.timer = 0;
                self.bzscroll = false;
                self.scrollrunning = false;
                return self;
            };

        }

        this.doScrollBy = function(stp, relative) {
            var ny = 0;
            if (relative) {
                ny = Math.floor((self.scroll.y - stp) * self.scrollratio.y)
            } else {
                var sy = (self.timer) ? self.newscrolly : self.getScrollTop(true);
                ny = sy - stp;
            }
            if (self.bouncescroll) {
                var haf = Math.round(self.view.h / 2);
                if (ny < -haf) ny = -haf
                else if (ny > (self.page.maxh + haf)) ny = (self.page.maxh + haf);
            }
            self.cursorfreezed = false;

            py = self.getScrollTop(true);
            if (ny < 0 && py <= 0) return self.noticeCursor();
            else if (ny > self.page.maxh && py >= self.page.maxh) {
                self.checkContentSize();
                return self.noticeCursor();
            }

            self.doScrollTop(ny);
        };

        this.doScrollLeftBy = function(stp, relative) {
            var nx = 0;
            if (relative) {
                nx = Math.floor((self.scroll.x - stp) * self.scrollratio.x)
            } else {
                var sx = (self.timer) ? self.newscrollx : self.getScrollLeft(true);
                nx = sx - stp;
            }
            if (self.bouncescroll) {
                var haf = Math.round(self.view.w / 2);
                if (nx < -haf) nx = -haf;
                else if (nx > (self.page.maxw + haf)) nx = (self.page.maxw + haf);
            }
            self.cursorfreezed = false;

            px = self.getScrollLeft(true);
            if (nx < 0 && px <= 0) return self.noticeCursor();
            else if (nx > self.page.maxw && px >= self.page.maxw) return self.noticeCursor();

            self.doScrollLeft(nx);
        };

        this.doScrollTo = function(pos, relative) {
            var ny = (relative) ? Math.round(pos * self.scrollratio.y) : pos;
            if (ny < 0) ny = 0;
            else if (ny > self.page.maxh) ny = self.page.maxh;
            self.cursorfreezed = false;
            self.doScrollTop(pos);
        };

        this.checkContentSize = function() {
            var pg = self.getContentSize();
            if ((pg.h != self.page.h) || (pg.w != self.page.w)) self.resize(false, pg);
        };

        self.onscroll = function(e) {
            if (self.rail.drag) return;
            if (!self.cursorfreezed) {
                self.synched('scroll', function() {
                    self.scroll.y = Math.round(self.getScrollTop() * (1 / self.scrollratio.y));
                    if (self.railh) self.scroll.x = Math.round(self.getScrollLeft() * (1 / self.scrollratio.x));
                    self.noticeCursor();
                });
            }
        };
        self.bind(self.docscroll, "scroll", self.onscroll);

        this.doZoomIn = function(e) {
            if (self.zoomactive) return;
            self.zoomactive = true;

            self.zoomrestore = {
                style: {}
            };
            var lst = ['position', 'top', 'left', 'zIndex', 'backgroundColor', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
            var win = self.win[0].style;
            for (var a in lst) {
                var pp = lst[a];
                self.zoomrestore.style[pp] = (typeof win[pp] != "undefined") ? win[pp] : '';
            }

            self.zoomrestore.style.width = self.win.css('width');
            self.zoomrestore.style.height = self.win.css('height');

            self.zoomrestore.padding = {
                w: self.win.outerWidth() - self.win.width(),
                h: self.win.outerHeight() - self.win.height()
            };

            if (cap.isios4) {
                self.zoomrestore.scrollTop = $(window).scrollTop();
                $(window).scrollTop(0);
            }

            self.win.css({
                "position": (cap.isios4) ? "absolute" : "fixed",
                "top": 0,
                "left": 0,
                "z-index": globalmaxzindex + 100,
                "margin": "0px"
            });
            var bkg = self.win.css("backgroundColor");
            if (bkg == "" || /transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(bkg)) self.win.css("backgroundColor", "#fff");
            self.rail.css({
                "z-index": globalmaxzindex + 101
            });
            self.zoom.css({
                "z-index": globalmaxzindex + 102
            });
            self.zoom.css('backgroundPosition', '0px -18px');
            self.resizeZoom();

            if (self.onzoomin) self.onzoomin.call(self);

            return self.cancelEvent(e);
        };

        this.doZoomOut = function(e) {
            if (!self.zoomactive) return;
            self.zoomactive = false;

            self.win.css("margin", "");
            self.win.css(self.zoomrestore.style);

            if (cap.isios4) {
                $(window).scrollTop(self.zoomrestore.scrollTop);
            }

            self.rail.css({
                "z-index": self.zindex
            });
            self.zoom.css({
                "z-index": self.zindex
            });
            self.zoomrestore = false;
            self.zoom.css('backgroundPosition', '0px 0px');
            self.onResize();

            if (self.onzoomout) self.onzoomout.call(self);

            return self.cancelEvent(e);
        };

        this.doZoom = function(e) {
            return (self.zoomactive) ? self.doZoomOut(e) : self.doZoomIn(e);
        };

        this.resizeZoom = function() {
            if (!self.zoomactive) return;

            var py = self.getScrollTop(); //preserve scrolling position
            self.win.css({
                width: $(window).width() - self.zoomrestore.padding.w + "px",
                height: $(window).height() - self.zoomrestore.padding.h + "px"
            });
            self.onResize();

            self.setScrollTop(Math.min(self.page.maxh, py));
        };

        this.init();

        $.nicescroll.push(this);

    };

    // Inspired by the work of Kin Blas
    // http://webpro.host.adobe.com/people/jblas/momentum/includes/jquery.momentum.0.7.js  


    var ScrollMomentumClass2D = function(nc) {
        var self = this;
        this.nc = nc;

        this.lastx = 0;
        this.lasty = 0;
        this.speedx = 0;
        this.speedy = 0;
        this.lasttime = 0;
        this.steptime = 0;
        this.snapx = false;
        this.snapy = false;
        this.demulx = 0;
        this.demuly = 0;

        this.lastscrollx = -1;
        this.lastscrolly = -1;

        this.chkx = 0;
        this.chky = 0;

        this.timer = 0;

        this.time = function() {
            return +new Date(); //beautifull hack
        };

        this.reset = function(px, py) {
            self.stop();
            var now = self.time();
            self.steptime = 0;
            self.lasttime = now;
            self.speedx = 0;
            self.speedy = 0;
            self.lastx = px;
            self.lasty = py;
            self.lastscrollx = -1;
            self.lastscrolly = -1;
        };

        this.update = function(px, py) {
            var now = self.time();
            self.steptime = now - self.lasttime;
            self.lasttime = now;
            var dy = py - self.lasty;
            var dx = px - self.lastx;
            var sy = self.nc.getScrollTop();
            var sx = self.nc.getScrollLeft();
            var newy = sy + dy;
            var newx = sx + dx;
            self.snapx = (newx < 0) || (newx > self.nc.page.maxw);
            self.snapy = (newy < 0) || (newy > self.nc.page.maxh);
            self.speedx = dx;
            self.speedy = dy;
            self.lastx = px;
            self.lasty = py;
        };

        this.stop = function() {
            self.nc.unsynched("domomentum2d");
            if (self.timer) clearTimeout(self.timer);
            self.timer = 0;
            self.lastscrollx = -1;
            self.lastscrolly = -1;
        };

        this.doSnapy = function(nx, ny) {
            var snap = false;

            if (ny < 0) {
                ny = 0;
                snap = true;
            } else if (ny > self.nc.page.maxh) {
                ny = self.nc.page.maxh;
                snap = true;
            }

            if (nx < 0) {
                nx = 0;
                snap = true;
            } else if (nx > self.nc.page.maxw) {
                nx = self.nc.page.maxw;
                snap = true;
            }

            (snap) ? self.nc.doScrollPos(nx, ny, self.nc.opt.snapbackspeed) : self.nc.triggerScrollEnd();
        };

        this.doMomentum = function(gp) {
            var t = self.time();
            var l = (gp) ? t + gp : self.lasttime;

            var sl = self.nc.getScrollLeft();
            var st = self.nc.getScrollTop();

            var pageh = self.nc.page.maxh;
            var pagew = self.nc.page.maxw;

            self.speedx = (pagew > 0) ? Math.min(60, self.speedx) : 0;
            self.speedy = (pageh > 0) ? Math.min(60, self.speedy) : 0;

            var chk = l && (t - l) <= 60;

            if ((st < 0) || (st > pageh) || (sl < 0) || (sl > pagew)) chk = false;

            var sy = (self.speedy && chk) ? self.speedy : false;
            var sx = (self.speedx && chk) ? self.speedx : false;

            if (sy || sx) {
                var tm = Math.max(16, self.steptime); //timeout granularity

                if (tm > 50) { // do smooth
                    var xm = tm / 50;
                    self.speedx *= xm;
                    self.speedy *= xm;
                    tm = 50;
                }

                self.demulxy = 0;

                self.lastscrollx = self.nc.getScrollLeft();
                self.chkx = self.lastscrollx;
                self.lastscrolly = self.nc.getScrollTop();
                self.chky = self.lastscrolly;

                var nx = self.lastscrollx;
                var ny = self.lastscrolly;

                var onscroll = function() {
                    var df = ((self.time() - t) > 600) ? 0.04 : 0.02;

                    if (self.speedx) {
                        nx = Math.floor(self.lastscrollx - (self.speedx * (1 - self.demulxy)));
                        self.lastscrollx = nx;
                        if ((nx < 0) || (nx > pagew)) df = 0.10;
                    }

                    if (self.speedy) {
                        ny = Math.floor(self.lastscrolly - (self.speedy * (1 - self.demulxy)));
                        self.lastscrolly = ny;
                        if ((ny < 0) || (ny > pageh)) df = 0.10;
                    }

                    self.demulxy = Math.min(1, self.demulxy + df);

                    self.nc.synched("domomentum2d", function() {

                        if (self.speedx) {
                            var scx = self.nc.getScrollLeft();
                            if (scx != self.chkx) self.stop();
                            self.chkx = nx;
                            self.nc.setScrollLeft(nx);
                        }

                        if (self.speedy) {
                            var scy = self.nc.getScrollTop();
                            if (scy != self.chky) self.stop();
                            self.chky = ny;
                            self.nc.setScrollTop(ny);
                        }

                        if (!self.timer) {
                            self.nc.hideCursor();
                            self.doSnapy(nx, ny);
                        }

                    });

                    if (self.demulxy < 1) {
                        self.timer = setTimeout(onscroll, tm);
                    } else {
                        self.stop();
                        self.nc.hideCursor();
                        self.doSnapy(nx, ny);
                    }
                };

                onscroll();

            } else {
                self.doSnapy(self.nc.getScrollLeft(), self.nc.getScrollTop());
            }

        }

    };


    // override jQuery scrollTop

    var _scrollTop = jQuery.fn.scrollTop; // preserve original function

    jQuery.cssHooks["pageYOffset"] = {
        get: function(elem, computed, extra) {
            var nice = $.data(elem, '__nicescroll') || false;
            return (nice && nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(elem);
        },
        set: function(elem, value) {
            var nice = $.data(elem, '__nicescroll') || false;
            (nice && nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call(elem, value);
            return this;
        }
    };

    /*  
  $.fx.step["scrollTop"] = function(fx){    
    $.cssHooks["scrollTop"].set( fx.elem, fx.now + fx.unit );
  };
*/

    jQuery.fn.scrollTop = function(value) {
        if (typeof value == "undefined") {
            var nice = (this[0]) ? $.data(this[0], '__nicescroll') || false : false;
            return (nice && nice.ishwscroll) ? nice.getScrollTop() : _scrollTop.call(this);
        } else {
            return this.each(function() {
                var nice = $.data(this, '__nicescroll') || false;
                (nice && nice.ishwscroll) ? nice.setScrollTop(parseInt(value)) : _scrollTop.call($(this), value);
            });
        }
    };

    // override jQuery scrollLeft

    var _scrollLeft = jQuery.fn.scrollLeft; // preserve original function

    $.cssHooks.pageXOffset = {
        get: function(elem, computed, extra) {
            var nice = $.data(elem, '__nicescroll') || false;
            return (nice && nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(elem);
        },
        set: function(elem, value) {
            var nice = $.data(elem, '__nicescroll') || false;
            (nice && nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call(elem, value);
            return this;
        }
    };

    /*  
  $.fx.step["scrollLeft"] = function(fx){
    $.cssHooks["scrollLeft"].set( fx.elem, fx.now + fx.unit );
  };  
*/

    jQuery.fn.scrollLeft = function(value) {
        if (typeof value == "undefined") {
            var nice = (this[0]) ? $.data(this[0], '__nicescroll') || false : false;
            return (nice && nice.ishwscroll) ? nice.getScrollLeft() : _scrollLeft.call(this);
        } else {
            return this.each(function() {
                var nice = $.data(this, '__nicescroll') || false;
                (nice && nice.ishwscroll) ? nice.setScrollLeft(parseInt(value)) : _scrollLeft.call($(this), value);
            });
        }
    };

    var NiceScrollArray = function(doms) {
        var self = this;
        this.length = 0;
        this.name = "nicescrollarray";

        this.each = function(fn) {
            for (var a = 0, i = 0; a < self.length; a++) fn.call(self[a], i++);
            return self;
        };

        this.push = function(nice) {
            self[self.length] = nice;
            self.length++;
        };

        this.eq = function(idx) {
            return self[idx];
        };

        if (doms) {
            for (var a = 0; a < doms.length; a++) {
                var nice = $.data(doms[a], '__nicescroll') || false;
                if (nice) {
                    this[this.length] = nice;
                    this.length++;
                }
            };
        }

        return this;
    };

    function mplex(el, lst, fn) {
        for (var a = 0; a < lst.length; a++) fn(el, lst[a]);
    };
    mplex(
        NiceScrollArray.prototype, ['show', 'hide', 'toggle', 'onResize', 'resize', 'remove', 'stop', 'doScrollPos'],
        function(e, n) {
            e[n] = function() {
                var args = arguments;
                return this.each(function() {
                    this[n].apply(this, args);
                });
            };
        }
    );

    jQuery.fn.getNiceScroll = function(index) {
        if (typeof index == "undefined") {
            return new NiceScrollArray(this);
        } else {
            var nice = this[index] && $.data(this[index], '__nicescroll') || false;
            return nice;
        }
    };

    jQuery.extend(jQuery.expr[':'], {
        nicescroll: function(a) {
            return ($.data(a, '__nicescroll')) ? true : false;
        }
    });

    $.fn.niceScroll = function(wrapper, opt) {
        if (typeof opt == "undefined") {
            if ((typeof wrapper == "object") && !("jquery" in wrapper)) {
                opt = wrapper;
                wrapper = false;
            }
        }
        var ret = new NiceScrollArray();
        if (typeof opt == "undefined") opt = {};

        if (wrapper || false) {
            opt.doc = $(wrapper);
            opt.win = $(this);
        }
        var docundef = !("doc" in opt);
        if (!docundef && !("win" in opt)) opt.win = $(this);

        this.each(function() {
            var nice = $(this).data('__nicescroll') || false;
            if (!nice) {
                opt.doc = (docundef) ? $(this) : opt.doc;
                nice = new NiceScrollClass(opt, $(this));
                $(this).data('__nicescroll', nice);
            }
            ret.push(nice);
        });
        return (ret.length == 1) ? ret[0] : ret;
    };

    window.NiceScroll = {
        getjQuery: function() {
            return jQuery
        }
    };

    if (!$.nicescroll) {
        $.nicescroll = new NiceScrollArray();
        $.nicescroll.options = _globaloptions;
    }

}));;/*
 *  jQuery OwlCarousel v1.3.2
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function($, window, document) {

    var Carousel = {
        init: function(options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent: function() {
            var base = this,
                url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn: function() {
            var base = this;

            base.$elem.data({
                "owl-originalStyles": base.$elem.attr("style"),
                "owl-originalClasses": base.$elem.attr("class")
            });

            base.$elem.css({
                opacity: 0
            });
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars: function() {
            var base = this;
            if (base.$elem.children().length === 0) {
                return false;
            }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup: function() {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate: function() {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars: function() {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload: function() {
            var base = this;
            window.setTimeout(function() {
                base.updateVars();
            }, 0);
        },

        watchVisibility: function() {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({
                    opacity: 0
                });
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function() {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({
                        opacity: 1
                    }, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems: function() {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass: function() {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems: function() {
            var base = this,
                width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function(a, b) {
                    return a[0] - b[0];
                });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response: function() {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function() {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function() {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition: function() {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes: function() {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function(index) {
                var $this = $(this);
                $this
                    .css({
                        "width": base.itemWidth
                    })
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes: function() {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll: function() {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth: function() {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max: function() {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min: function() {
            return 0;
        },

        loops: function() {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls: function() {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons: function() {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class": "owl-prev",
                "html": base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class": "owl-next",
                "html": base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function(event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function(event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination: function() {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function(event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination: function() {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class": "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination: function() {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function() {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation: function() {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls: function() {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls: function() {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next: function(speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev: function(speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo: function(position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function() {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function() {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function() {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo: function(position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo: function() {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop: function() {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp: function() {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play: function() {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function() {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed: function(action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed: function(speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition: function() {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate: function(pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d: function(value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move: function(value) {
            var base = this;
            base.$owlWrapper.css({
                "left": value
            });
        },

        css2slide: function(value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left": value
            }, {
                duration: speed || base.options.slideSpeed,
                complete: function() {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser: function() {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                "; -ms-transform:" + translate3D +
                "; -o-transform:" + translate3D +
                "; -webkit-transform:" + translate3D +
                "; transform:" + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d": support3d,
                "isTouch": isTouch
            };
        },

        moveEvents: function() {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes: function() {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents: function() {
            var base = this;
            base.$elem.on("dragstart.owl", function(event) {
                event.preventDefault();
            });
            base.$elem.on("mousedown.disableTextSelect", function(e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures: function() {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX: 0,
                    offsetY: 0,
                    baseElWidth: 0,
                    relativePos: 0,
                    position: null,
                    minSwipe: null,
                    maxSwipe: null,
                    sliding: null,
                    dargging: null,
                    targetElement: null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x: event.touches[0].pageX,
                        y: event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x: event.pageX,
                            y: event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x: event.clientX,
                            y: event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function() {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function() {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function(ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition: function() {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem: function() {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function(i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection: function() {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents: function() {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function() {
                base.next();
            });
            base.$elem.on("owl.prev", function() {
                base.prev();
            });
            base.$elem.on("owl.play", function(event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function() {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function(event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function(event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover: function() {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function() {
                    base.stop();
                });
                base.$elem.on("mouseout", function() {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad: function() {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    $lazyImg.each(function() {
                        base.lazyPreload($item, $(this));
                    });
                }
            }
        },

        lazyPreload: function($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight: function() {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function() {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg: function(img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems: function() {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes: function(className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition: function() {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin": origin + "px",
                    "-moz-perspective-origin": origin + "px",
                    "perspective-origin": origin + "px"
                });

            function transStyles(prevPos) {
                return {
                    "position": "relative",
                    "left": prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function() {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function() {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle: function(item, classToRemove) {
            var base = this;
            item.css({
                "position": "",
                "left": ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus: function() {
            var base = this;
            base.owl = {
                "userOptions": base.userOptions,
                "baseElement": base.$elem,
                "userItems": base.$userItems,
                "owlItems": base.$owlItems,
                "currentItem": base.currentItem,
                "prevItem": base.prevItem,
                "visibleItems": base.visibleItems,
                "isTouch": base.browser.isTouch,
                "browser": base.browser,
                "dragDirection": base.dragDirection
            };
        },

        clearEvents: function() {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap: function() {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem.attr({
                style: base.$elem.data("owl-originalStyles") || "",
                class: base.$elem.data("owl-originalClasses")
            });
        },

        destroy: function() {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit: function(newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem: function(htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {
                return false;
            }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem: function(targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function(options) {
        return this.each(function() {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items: 5,
        itemsCustom: false,
        itemsDesktop: [1199, 4],
        itemsDesktopSmall: [979, 3],
        itemsTablet: [768, 2],
        itemsTabletSmall: false,
        itemsMobile: [479, 1],
        singleItem: false,
        itemsScaleUp: false,

        slideSpeed: 200,
        paginationSpeed: 800,
        rewindSpeed: 1000,

        autoPlay: false,
        stopOnHover: false,

        navigation: false,
        navigationText: ["prev", "next"],
        rewindNav: true,
        scrollPerPage: false,

        pagination: true,
        paginationNumbers: false,

        responsive: true,
        responsiveRefreshRate: 200,
        responsiveBaseWidth: window,

        baseClass: "owl-carousel",
        theme: "owl-theme",

        lazyLoad: false,
        lazyFollow: true,
        lazyEffect: "fade",

        autoHeight: false,

        jsonPath: false,
        jsonSuccess: false,

        dragBeforeAnimFinish: true,
        mouseDrag: true,
        touchDrag: true,

        addClassActive: false,
        transitionStyle: false,

        beforeUpdate: false,
        afterUpdate: false,
        beforeInit: false,
        afterInit: false,
        beforeMove: false,
        afterMove: false,
        afterAction: false,
        startDragging: false,
        afterLazyLoad: false
    };
}(jQuery, window, document));;/**
 * jquery.slimmenu.js
 * http://adnantopal.github.io/slimmenu/
 * Author: @adnantopal
 * Copyright 2013, Adnan Topal (atopal.com)
 * Licensed under the MIT license.
 */
;(function ( $, window, document, undefined )
{
    var pluginName = "slimmenu",
        defaults =
        {
            resizeWidth: '768',
            collapserTitle: 'Main Menu',
            animSpeed: 'medium',
            easingEffect: null,
            indentChildren: false,
            childrenIndenter: '&nbsp;&nbsp;'
        };

    function Plugin( element, options )
    {
        this.element = element;
        this.$elem = $(this.element);
        this.options = $.extend( {}, defaults, options );
        this.init();
    }

    Plugin.prototype = {

        init: function()
        {
            var $options = this.options,
                $menu = this.$elem,
                $collapser = '<div class="slimmenu-menu-collapser">'+$options.collapserTitle+'<div class="slimmenu-collapse-button"><span class="slimmenu-icon-bar"></span><span class="slimmenu-icon-bar"></span><span class="slimmenu-icon-bar"></span></div></div>',
                $menu_collapser;

            $menu.before($collapser);
            $menu_collapser = $menu.prev('.slimmenu-menu-collapser');

            $menu.on('click', '.slimmenu-sub-collapser', function(e)
            {
                e.preventDefault();
                e.stopPropagation();

                var $parent_li = $(this).closest('li');

                if ($(this).hasClass('expanded'))
                {
                    $(this).removeClass('expanded');
                    $(this).find('i').addClass('fa fa-angle-down');
                    $parent_li.find('>ul').slideUp($options.animSpeed, $options.easingEffect);
                }
                else
                {
                    $(this).addClass('expanded');
                    $(this).find('i').removeClass('fa-angle-down').addClass('fa fa-angle-up');
                    $parent_li.find('>ul').slideDown($options.animSpeed, $options.easingEffect);
                }
            });

            $menu_collapser.on('click', '.slimmenu-collapse-button', function(e)
            {
                e.preventDefault();
                $menu.slideToggle($options.animSpeed, $options.easingEffect);
            });

            this.resizeMenu({ data: { el: this.element, options: this.options } });
            $(window).on('resize', { el: this.element, options: this.options }, this.resizeMenu);
        },

        resizeMenu: function(event)
        {
            var $window = $(window),
                $options = event.data.options,
                $menu = $(event.data.el),
                $menu_collapser = $('body').find('.slimmenu-menu-collapser');

            $menu.find('li').each(function()
            {
                if ($(this).has('ul').length)
                {
                    $(this).addClass('slimmenu-sub-menu');
                    if ($(this).has('.slimmenu-sub-collapser').length)
                    {
                        $(this).children('.slimmenu-sub-collapser i').addClass('fa fa-angle-down');
                    }
                    else
                    {
                        $(this).append('<span class="slimmenu-sub-collapser"><i class="fa fa-angle-down"></i></span>');
                    }
                }

                $(this).children('ul').hide();
                $(this).find('.slimmenu-sub-collapser').removeClass('expanded').children('i').addClass('fa fa-angle-down');
            });

            if ($options.resizeWidth >= $window.width() || $('body').hasClass('touch'))
            {
                if ($options.indentChildren)
                {
                    $menu.find('ul').each(function()
                    {
                        var $depth = $(this).parents('ul').length;
                        if (!$(this).children('li').children('a').has('i').length)
                        {
                            $(this).children('li').children('a').prepend(Plugin.prototype.indent($depth, $options));
                        }
                    });
                }

                $menu.find('li').has('ul').off('mouseenter mouseleave');
                $menu.addClass('slimmenu-collapsed').hide();
                $menu_collapser.show();
            }
            else
            {
                $menu.find('li').has('ul').on('mouseenter', function()
                {
                    $(this).find('>ul').stop().slideDown($options.animSpeed, $options.easingEffect);
                })
                .on('mouseleave', function()
                {
                    $(this).find('>ul').stop().slideUp($options.animSpeed, $options.easingEffect);
                });

                $menu.find('li > a > i').remove();
                $menu.removeClass('slimmenu-collapsed').show();
                $menu_collapser.hide();
            }
        },

        indent: function(num, options)
        {
            var $indent = '';
            for (var i=0; i < num; i++)
            {
                $indent += options.childrenIndenter;
            }
            return '<i>'+$indent+'</i>';
        }
    };

    $.fn[pluginName] = function ( options )
    {
        return this.each(function ()
        {
            if (!$.data(this, "plugin_" + pluginName))
            {
                $.data(this, "plugin_" + pluginName,
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );;// jquery.tweet.js - See http://tweet.seaofclouds.com/ or https://github.com/seaofclouds/tweet for more info
// Copyright (c) 2008-2012 Todd Matthews & Steve Purcell
// Modified by Stan Scates for https://github.com/StanScates/Tweet.js-Mod

(function (factory) {
	if (typeof define === 'function' && define.amd)
	define(['jquery'], factory); // AMD support for RequireJS etc.
	else
	factory(jQuery);
}(function ($) {
	$.fn.tweet = function(o){
		var s = $.extend({
			modpath: "./includes/twitter/",                     // [string]   relative URL to Tweet.js mod (see https://github.com/StanScates/Tweet.js-Mod)
			username: null,                           // [string or array] required unless using the 'query' option; one or more twitter screen names (use 'list' option for multiple names, where possible)
			list_id: null,                            // [integer]  ID of list to fetch when using list functionality
			list: null,                               // [string]   optional slug of list belonging to username
			favorites: false,                         // [boolean]  display the user's favorites instead of his tweets
			query: null,                              // [string]   optional search query (see also: http://search.twitter.com/operators)
			avatar_size: null,                        // [integer]  height and width of avatar if displayed (48px max)
			count: 3,                                 // [integer]  how many tweets to display?
			fetch: null,                              // [integer]  how many tweets to fetch via the API (set this higher than 'count' if using the 'filter' option)
			page: 1,                                  // [integer]  which page of results to fetch (if count != fetch, you'll get unexpected results)
			retweets: true,                           // [boolean]  whether to fetch (official) retweets (not supported in all display modes)
			intro_text: null,                         // [string]   do you want text BEFORE your your tweets?
			outro_text: null,                         // [string]   do you want text AFTER your tweets?
			join_text:  null,                         // [string]   optional text in between date and tweet, try setting to "auto"
			auto_join_text_default: "i said,",        // [string]   auto text for non verb: "i said" bullocks
			auto_join_text_ed: "i",                   // [string]   auto text for past tense: "i" surfed
			auto_join_text_ing: "i am",               // [string]   auto tense for present tense: "i was" surfing
			auto_join_text_reply: "i replied to",     // [string]   auto tense for replies: "i replied to" @someone "with"
			auto_join_text_url: "i was looking at",   // [string]   auto tense for urls: "i was looking at" http:...
			loading_text: null,                       // [string]   optional loading text, displayed while tweets load
			refresh_interval: null ,                  // [integer]  optional number of seconds after which to reload tweets
			twitter_url: "twitter.com",               // [string]   custom twitter url, if any (apigee, etc.)
			twitter_api_url: "api.twitter.com",       // [string]   custom twitter api url, if any (apigee, etc.)
			twitter_search_url: "api.twitter.com", // [string]   custom twitter search url, if any (apigee, etc.)
			template: "{avatar}{time}{join}{text}",   // [string or function] template used to construct each tweet <li> - see code for available vars
			comparator: function(tweet1, tweet2) {    // [function] comparator used to sort tweets (see Array.sort)
				return tweet2["tweet_time"] - tweet1["tweet_time"];
			},
			filter: function(tweet) {                 // [function] whether or not to include a particular tweet (be sure to also set 'fetch')
				return true;
			}
		// You can attach callbacks to the following events using jQuery's standard .bind() mechanism:
		//   "loaded" -- triggered when tweets have been fetched and rendered
		}, o);

		// See http://daringfireball.net/2010/07/improved_regex_for_matching_urls
		var url_regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;

		// Expand values inside simple string templates with {placeholders}
		function t(template, info) {
			if (typeof template === "string") {
				var result = template;
				for(var key in info) {
					var val = info[key];
					result = result.replace(new RegExp('{'+key+'}','g'), val === null ? '' : val);
				}
				return result;
			} else return template(info);
		}
		// Export the t function for use when passing a function as the 'template' option
		$.extend({tweet: {t: t}});

		function replacer (regex, replacement) {
			return function() {
				var returning = [];
				this.each(function() {
					returning.push(this.replace(regex, replacement));
				});
				return $(returning);
			};
		}

		function escapeHTML(s) {
			return s.replace(/</g,"&lt;").replace(/>/g,"^&gt;");
		}

		$.fn.extend({
			linkUser: replacer(/(^|[\W])@(\w+)/gi, "$1<span class=\"at\">@</span><a href=\"http://"+s.twitter_url+"/$2\">$2</a>"),
			// Support various latin1 (\u00**) and arabic (\u06**) alphanumeric chars
			linkHash: replacer(/(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi,
				' <a href="https://twitter.com/search?q=%23$1'+((s.username && s.username.length == 1 && !s.list) ? '&from='+s.username.join("%2BOR%2B") : '')+'" class="tweet_hashtag">#$1</a>'),
			makeHeart: replacer(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>")
		});

		function linkURLs(text, entities) {
			return text.replace(url_regexp, function(match) {
				var url = (/^[a-z]+:/i).test(match) ? match : "http://"+match;
				var text = match;
				for(var i = 0; i < entities.length; ++i) {
					var entity = entities[i];
					if (entity.url == url && entity.expanded_url) {
						url = entity.expanded_url;
						text = entity.display_url;
						break;
					}
				}
				return "<a href=\""+escapeHTML(url)+"\">"+escapeHTML(text)+"</a>";
			});
		}

		function parse_date(date_str) {
			// The non-search twitter APIs return inconsistently-formatted dates, which Date.parse
			// cannot handle in IE. We therefore perform the following transformation:
			// "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 +0000"
			return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
		}

		function relative_time(date) {
			var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
			var delta = parseInt((relative_to.getTime() - date) / 1000, 10);
			var r = '';
			if (delta < 1) {
				r = 'just now';
			} else if (delta < 60) {
				r = delta + ' seconds ago';
			} else if(delta < 120) {
				r = 'about a minute ago';
			} else if(delta < (45*60)) {
				r = 'about ' + (parseInt(delta / 60, 10)).toString() + ' minutes ago';
			} else if(delta < (2*60*60)) {
				r = 'about an hour ago';
			} else if(delta < (24*60*60)) {
				r = 'about ' + (parseInt(delta / 3600, 10)).toString() + ' hours ago';
			} else if(delta < (48*60*60)) {
				r = 'about a day ago';
			} else {
				r = 'about ' + (parseInt(delta / 86400, 10)).toString() + ' days ago';
			}
			return r;
		}

		function build_auto_join_text(text) {
			if (text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
				return s.auto_join_text_reply;
			} else if (text.match(url_regexp)) {
				return s.auto_join_text_url;
			} else if (text.match(/^((\w+ed)|just) .*/im)) {
				return s.auto_join_text_ed;
			} else if (text.match(/^(\w*ing) .*/i)) {
				return s.auto_join_text_ing;
			} else {
				return s.auto_join_text_default;
			}
		}

		function build_api_request() {
			var modpath = s.modpath,
				count = (s.fetch === null) ? s.count : s.fetch,
				defaults = {
					include_entities: 1
				};

			if (s.list) {
				return {
					host: s.twitter_api_url,
					url: "/1.1/lists/statuses.json",
					parameters: $.extend({}, defaults, {
						list_id: s.list_id,
						slug: s.list,
						owner_screen_name: s.username,
						page: s.page,
						count: count,
						include_rts: (s.retweets ? 1 : 0)
					})
				};
			} else if (s.favorites) {
				return {
					host: s.twitter_api_url,
					url: "/1.1/favorites/list.json",
					parameters: $.extend({}, defaults, {
						list_id: s.list_id,
						screen_name: s.username,
						page: s.page,
						count: count
					})
				};
			} else if (s.query === null && s.username.length === 1) {
				return {
					host: s.twitter_api_url,
					url: "/1.1/statuses/user_timeline.json",
					parameters: $.extend({}, defaults, {
						screen_name: s.username,
						page: s.page,
						count: count,
						include_rts: (s.retweets ? 1 : 0)
					})
				};
			} else {
				var query = (s.query || 'from:'+s.username.join(' OR from:'));
				return {
					host: s.twitter_search_url,
					url: "/1.1/search/tweets.json",
					parameters: $.extend({}, defaults, {
						q: query,
						count: count
					})
				};
			}
		}

		function extract_avatar_url(item, secure) {
			if (secure) {
				return ('user' in item) ?
					item.user.profile_image_url_https :
					extract_avatar_url(item, false).
					replace(/^http:\/\/[a-z0-9]{1,3}\.twimg\.com\//, "https://s3.amazonaws.com/twitter_production/");
			} else {
				return item.profile_image_url || item.user.profile_image_url;
			}
		}

		// Convert twitter API objects into data available for
		// constructing each tweet <li> using a template
		function extract_template_data(item) {
			var o = {};
			o.item = item;
			o.source = item.source;
			// The actual user name is not returned by all Twitter APIs, so please do not file an issue if it is empty.
			o.name = item.from_user_name || item.user.name;
			o.screen_name = item.from_user || item.user.screen_name;
			o.avatar_size = s.avatar_size;
			o.avatar_url = extract_avatar_url(item, (document.location.protocol === 'https:'));
			o.retweet = typeof(item.retweeted_status) != 'undefined';
			o.tweet_time = parse_date(item.created_at);
			o.join_text = s.join_text == "auto" ? build_auto_join_text(item.text) : s.join_text;
			o.tweet_id = item.id_str;
			o.twitter_base = "http://"+s.twitter_url+"/";
			o.user_url = o.twitter_base+o.screen_name;
			o.tweet_url = o.user_url+"/status/"+o.tweet_id;
			o.reply_url = o.twitter_base+"intent/tweet?in_reply_to="+o.tweet_id;
			o.retweet_url = o.twitter_base+"intent/retweet?tweet_id="+o.tweet_id;
			o.favorite_url = o.twitter_base+"intent/favorite?tweet_id="+o.tweet_id;
			o.retweeted_screen_name = o.retweet && item.retweeted_status.user.screen_name;
			o.tweet_relative_time = relative_time(o.tweet_time);
			o.entities = item.entities ? (item.entities.urls || []).concat(item.entities.media || []) : [];
			o.tweet_raw_text = o.retweet ? ('RT @'+o.retweeted_screen_name+' '+item.retweeted_status.text) : item.text; // avoid '...' in long retweets
			o.tweet_text = $([linkURLs(o.tweet_raw_text, o.entities)]).linkUser().linkHash()[0];
			o.tweet_text_fancy = $([o.tweet_text]).makeHeart()[0];

			// Default spans, and pre-formatted blocks for common layouts
			o.user = t('<a class="tweet_user" href="{user_url}">{screen_name}</a>', o);
			o.join = s.join_text ? t(' <span class="tweet_join">{join_text}</span> ', o) : ' ';
			o.avatar = o.avatar_size ?
				t('<a class="tweet_avatar" href="{user_url}"><img src="{avatar_url}" height="{avatar_size}" width="{avatar_size}" alt="{screen_name}\'s avatar" title="{screen_name}\'s avatar" border="0"/></a>', o) : '';
			o.time = t('<span class="tweet-time"><a href="{tweet_url}" title="view tweet on twitter">{tweet_relative_time}</a></span>', o);
			o.text = t('<span class="tweet-text">{tweet_text_fancy}</span>', o);
			o.reply_action = t('<a class="tweet_action tweet_reply" href="{reply_url}">reply</a>', o);
			o.retweet_action = t('<a class="tweet_action tweet_retweet" href="{retweet_url}">retweet</a>', o);
			o.favorite_action = t('<a class="tweet_action tweet_favorite" href="{favorite_url}">favorite</a>', o);
			return o;
		}

		return this.each(function(i, widget){
			var list = $('<ul class="tweet-list">');
			var intro = '<p class="tweet-intro">'+s.intro_text+'</p>';
			var outro = '<p class="tweet-outro">'+s.outro_text+'</p>';
			var loading = $('<p class="loading">'+s.loading_text+'</p>');

			if(s.username && typeof(s.username) == "string"){
				s.username = [s.username];
			}

			$(widget).unbind("tweet:load").bind("tweet:load", function(){
				if (s.loading_text) $(widget).empty().append(loading);

				$.ajax({
					dataType: "json",
					type: "post",
					async: false,
					url: s.modpath || "/twitter/",
					data: { request: build_api_request() },
					success: function(data, status) {

						if(data.message) {
							console.log(data.message);
						}

						var response = data.response;
						$(widget).empty().append(list);
						if (s.intro_text) list.before(intro);
						list.empty();

						if(response.statuses !== undefined) {
							resp = response.statuses;
						} else if(response.results !== undefined) {
							resp = response.results;
						} else {
							resp = response;
						}

						var tweets = $.map(resp, extract_template_data);
							tweets = $.grep(tweets, s.filter).sort(s.comparator).slice(0, s.count);

						list.append($.map(tweets, function(o) { return "<li>" + t(s.template, o) + "</li>"; }).join('')).
							children('li:first').addClass('tweet-first').end().
							children('li:odd').addClass('tweet-even').end().
							children('li:even').addClass('tweet-odd');

						if (s.outro_text) list.after(outro);
						$(widget).trigger("loaded").trigger((tweets ? "empty" : "full"));
						if (s.refresh_interval) {
							window.setTimeout(function() { $(widget).trigger("tweet:load"); }, 1000 * s.refresh_interval);
						}
					}
				});
			}).trigger("tweet:load");
		});
	};
}));;/*!
 * typeahead.js 0.10.2
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

! function(a) {
    var b = {
        isMsie: function() {
            return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : !1
        },
        isBlankString: function(a) {
            return !a || /^\s*$/.test(a)
        },
        escapeRegExChars: function(a) {
            return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        },
        isString: function(a) {
            return "string" == typeof a
        },
        isNumber: function(a) {
            return "number" == typeof a
        },
        isArray: a.isArray,
        isFunction: a.isFunction,
        isObject: a.isPlainObject,
        isUndefined: function(a) {
            return "undefined" == typeof a
        },
        bind: a.proxy,
        each: function(b, c) {
            function d(a, b) {
                return c(b, a)
            }
            a.each(b, d)
        },
        map: a.map,
        filter: a.grep,
        every: function(b, c) {
            var d = !0;
            return b ? (a.each(b, function(a, e) {
                return (d = c.call(null, e, a, b)) ? void 0 : !1
            }), !! d) : d
        },
        some: function(b, c) {
            var d = !1;
            return b ? (a.each(b, function(a, e) {
                return (d = c.call(null, e, a, b)) ? !1 : void 0
            }), !! d) : d
        },
        mixin: a.extend,
        getUniqueId: function() {
            var a = 0;
            return function() {
                return a++
            }
        }(),
        templatify: function(b) {
            function c() {
                return String(b)
            }
            return a.isFunction(b) ? b : c
        },
        defer: function(a) {
            setTimeout(a, 0)
        },
        debounce: function(a, b, c) {
            var d, e;
            return function() {
                var f, g, h = this,
                    i = arguments;
                return f = function() {
                    d = null, c || (e = a.apply(h, i))
                }, g = c && !d, clearTimeout(d), d = setTimeout(f, b), g && (e = a.apply(h, i)), e
            }
        },
        throttle: function(a, b) {
            var c, d, e, f, g, h;
            return g = 0, h = function() {
                g = new Date, e = null, f = a.apply(c, d)
            },
            function() {
                var i = new Date,
                    j = b - (i - g);
                return c = this, d = arguments, 0 >= j ? (clearTimeout(e), e = null, g = i, f = a.apply(c, d)) : e || (e = setTimeout(h, j)), f
            }
        },
        noop: function() {}
    }, c = "0.10.2",
        d = function() {
            function a(a) {
                return a.split(/\s+/)
            }

            function b(a) {
                return a.split(/\W+/)
            }

            function c(a) {
                return function(b) {
                    return function(c) {
                        return a(c[b])
                    }
                }
            }
            return {
                nonword: b,
                whitespace: a,
                obj: {
                    nonword: c(b),
                    whitespace: c(a)
                }
            }
        }(),
        e = function() {
            function a(a) {
                this.maxSize = a || 100, this.size = 0, this.hash = {}, this.list = new c
            }

            function c() {
                this.head = this.tail = null
            }

            function d(a, b) {
                this.key = a, this.val = b, this.prev = this.next = null
            }
            return b.mixin(a.prototype, {
                set: function(a, b) {
                    var c, e = this.list.tail;
                    this.size >= this.maxSize && (this.list.remove(e), delete this.hash[e.key]), (c = this.hash[a]) ? (c.val = b, this.list.moveToFront(c)) : (c = new d(a, b), this.list.add(c), this.hash[a] = c, this.size++)
                },
                get: function(a) {
                    var b = this.hash[a];
                    return b ? (this.list.moveToFront(b), b.val) : void 0
                }
            }), b.mixin(c.prototype, {
                add: function(a) {
                    this.head && (a.next = this.head, this.head.prev = a), this.head = a, this.tail = this.tail || a
                },
                remove: function(a) {
                    a.prev ? a.prev.next = a.next : this.head = a.next, a.next ? a.next.prev = a.prev : this.tail = a.prev
                },
                moveToFront: function(a) {
                    this.remove(a), this.add(a)
                }
            }), a
        }(),
        f = function() {
            function a(a) {
                this.prefix = ["__", a, "__"].join(""), this.ttlKey = "__ttl__", this.keyMatcher = new RegExp("^" + this.prefix)
            }

            function c() {
                return (new Date).getTime()
            }

            function d(a) {
                return JSON.stringify(b.isUndefined(a) ? null : a)
            }

            function e(a) {
                return JSON.parse(a)
            }
            var f, g;
            try {
                f = window.localStorage, f.setItem("~~~", "!"), f.removeItem("~~~")
            } catch (h) {
                f = null
            }
            return g = f && window.JSON ? {
                _prefix: function(a) {
                    return this.prefix + a
                },
                _ttlKey: function(a) {
                    return this._prefix(a) + this.ttlKey
                },
                get: function(a) {
                    return this.isExpired(a) && this.remove(a), e(f.getItem(this._prefix(a)))
                },
                set: function(a, e, g) {
                    return b.isNumber(g) ? f.setItem(this._ttlKey(a), d(c() + g)) : f.removeItem(this._ttlKey(a)), f.setItem(this._prefix(a), d(e))
                },
                remove: function(a) {
                    return f.removeItem(this._ttlKey(a)), f.removeItem(this._prefix(a)), this
                },
                clear: function() {
                    var a, b, c = [],
                        d = f.length;
                    for (a = 0; d > a; a++)(b = f.key(a)).match(this.keyMatcher) && c.push(b.replace(this.keyMatcher, ""));
                    for (a = c.length; a--;) this.remove(c[a]);
                    return this
                },
                isExpired: function(a) {
                    var d = e(f.getItem(this._ttlKey(a)));
                    return b.isNumber(d) && c() > d ? !0 : !1
                }
            } : {
                get: b.noop,
                set: b.noop,
                remove: b.noop,
                clear: b.noop,
                isExpired: b.noop
            }, b.mixin(a.prototype, g), a
        }(),
        g = function() {
            function c(b) {
                b = b || {}, this._send = b.transport ? d(b.transport) : a.ajax, this._get = b.rateLimiter ? b.rateLimiter(this._get) : this._get
            }

            function d(c) {
                return function(d, e) {
                    function f(a) {
                        b.defer(function() {
                            h.resolve(a)
                        })
                    }

                    function g(a) {
                        b.defer(function() {
                            h.reject(a)
                        })
                    }
                    var h = a.Deferred();
                    return c(d, e, f, g), h
                }
            }
            var f = 0,
                g = {}, h = 6,
                i = new e(10);
            return c.setMaxPendingRequests = function(a) {
                h = a
            }, c.resetCache = function() {
                i = new e(10)
            }, b.mixin(c.prototype, {
                _get: function(a, b, c) {
                    function d(b) {
                        c && c(null, b), i.set(a, b)
                    }

                    function e() {
                        c && c(!0)
                    }

                    function j() {
                        f--, delete g[a], l.onDeckRequestArgs && (l._get.apply(l, l.onDeckRequestArgs), l.onDeckRequestArgs = null)
                    }
                    var k, l = this;
                    (k = g[a]) ? k.done(d).fail(e) : h > f ? (f++, g[a] = this._send(a, b).done(d).fail(e).always(j)) : this.onDeckRequestArgs = [].slice.call(arguments, 0)
                },
                get: function(a, c, d) {
                    var e;
                    return b.isFunction(c) && (d = c, c = {}), (e = i.get(a)) ? b.defer(function() {
                        d && d(null, e)
                    }) : this._get(a, c, d), !! e
                }
            }), c
        }(),
        h = function() {
            function c(b) {
                b = b || {}, b.datumTokenizer && b.queryTokenizer || a.error("datumTokenizer and queryTokenizer are both required"), this.datumTokenizer = b.datumTokenizer, this.queryTokenizer = b.queryTokenizer, this.reset()
            }

            function d(a) {
                return a = b.filter(a, function(a) {
                    return !!a
                }), a = b.map(a, function(a) {
                    return a.toLowerCase()
                })
            }

            function e() {
                return {
                    ids: [],
                    children: {}
                }
            }

            function f(a) {
                for (var b = {}, c = [], d = 0; d < a.length; d++) b[a[d]] || (b[a[d]] = !0, c.push(a[d]));
                return c
            }

            function g(a, b) {
                function c(a, b) {
                    return a - b
                }
                var d = 0,
                    e = 0,
                    f = [];
                for (a = a.sort(c), b = b.sort(c); d < a.length && e < b.length;) a[d] < b[e] ? d++ : a[d] > b[e] ? e++ : (f.push(a[d]), d++, e++);
                return f
            }
            return b.mixin(c.prototype, {
                bootstrap: function(a) {
                    this.datums = a.datums, this.trie = a.trie
                },
                add: function(a) {
                    var c = this;
                    a = b.isArray(a) ? a : [a], b.each(a, function(a) {
                        var f, g;
                        f = c.datums.push(a) - 1, g = d(c.datumTokenizer(a)), b.each(g, function(a) {
                            var b, d, g;
                            for (b = c.trie, d = a.split(""); g = d.shift();) b = b.children[g] || (b.children[g] = e()), b.ids.push(f)
                        })
                    })
                },
                get: function(a) {
                    var c, e, h = this;
                    return c = d(this.queryTokenizer(a)), b.each(c, function(a) {
                        var b, c, d, f;
                        if (e && 0 === e.length) return !1;
                        for (b = h.trie, c = a.split(""); b && (d = c.shift());) b = b.children[d];
                        return b && 0 === c.length ? (f = b.ids.slice(0), void(e = e ? g(e, f) : f)) : (e = [], !1)
                    }), e ? b.map(f(e), function(a) {
                        return h.datums[a]
                    }) : []
                },
                reset: function() {
                    this.datums = [], this.trie = e()
                },
                serialize: function() {
                    return {
                        datums: this.datums,
                        trie: this.trie
                    }
                }
            }), c
        }(),
        i = function() {
            function d(a) {
                return a.local || null
            }

            function e(d) {
                var e, f;
                return f = {
                    url: null,
                    thumbprint: "",
                    ttl: 864e5,
                    filter: null,
                    ajax: {}
                }, (e = d.prefetch || null) && (e = b.isString(e) ? {
                    url: e
                } : e, e = b.mixin(f, e), e.thumbprint = c + e.thumbprint, e.ajax.type = e.ajax.type || "GET", e.ajax.dataType = e.ajax.dataType || "json", !e.url && a.error("prefetch requires url to be set")), e
            }

            function f(c) {
                function d(a) {
                    return function(c) {
                        return b.debounce(c, a)
                    }
                }

                function e(a) {
                    return function(c) {
                        return b.throttle(c, a)
                    }
                }
                var f, g;
                return g = {
                    url: null,
                    wildcard: "%QUERY",
                    replace: null,
                    rateLimitBy: "debounce",
                    rateLimitWait: 300,
                    send: null,
                    filter: null,
                    ajax: {}
                }, (f = c.remote || null) && (f = b.isString(f) ? {
                    url: f
                } : f, f = b.mixin(g, f), f.rateLimiter = /^throttle$/i.test(f.rateLimitBy) ? e(f.rateLimitWait) : d(f.rateLimitWait), f.ajax.type = f.ajax.type || "GET", f.ajax.dataType = f.ajax.dataType || "json", delete f.rateLimitBy, delete f.rateLimitWait, !f.url && a.error("remote requires url to be set")), f
            }
            return {
                local: d,
                prefetch: e,
                remote: f
            }
        }();
    ! function(c) {
        function e(b) {
            b && (b.local || b.prefetch || b.remote) || a.error("one of local, prefetch, or remote is required"), this.limit = b.limit || 5, this.sorter = j(b.sorter), this.dupDetector = b.dupDetector || k, this.local = i.local(b), this.prefetch = i.prefetch(b), this.remote = i.remote(b), this.cacheKey = this.prefetch ? this.prefetch.cacheKey || this.prefetch.url : null, this.index = new h({
                datumTokenizer: b.datumTokenizer,
                queryTokenizer: b.queryTokenizer
            }), this.storage = this.cacheKey ? new f(this.cacheKey) : null
        }

        function j(a) {
            function c(b) {
                return b.sort(a)
            }

            function d(a) {
                return a
            }
            return b.isFunction(a) ? c : d
        }

        function k() {
            return !1
        }
        var l, m;
        return l = c.Bloodhound, m = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        }, c.Bloodhound = e, e.noConflict = function() {
            return c.Bloodhound = l, e
        }, e.tokenizers = d, b.mixin(e.prototype, {
            _loadPrefetch: function(b) {
                function c(a) {
                    f.clear(), f.add(b.filter ? b.filter(a) : a), f._saveToStorage(f.index.serialize(), b.thumbprint, b.ttl)
                }
                var d, e, f = this;
                return (d = this._readFromStorage(b.thumbprint)) ? (this.index.bootstrap(d), e = a.Deferred().resolve()) : e = a.ajax(b.url, b.ajax).done(c), e
            },
            _getFromRemote: function(a, b) {
                function c(a, c) {
                    b(a ? [] : f.remote.filter ? f.remote.filter(c) : c)
                }
                var d, e, f = this;
                return a = a || "", e = encodeURIComponent(a), d = this.remote.replace ? this.remote.replace(this.remote.url, a) : this.remote.url.replace(this.remote.wildcard, e), this.transport.get(d, this.remote.ajax, c)
            },
            _saveToStorage: function(a, b, c) {
                this.storage && (this.storage.set(m.data, a, c), this.storage.set(m.protocol, location.protocol, c), this.storage.set(m.thumbprint, b, c))
            },
            _readFromStorage: function(a) {
                var b, c = {};
                return this.storage && (c.data = this.storage.get(m.data), c.protocol = this.storage.get(m.protocol), c.thumbprint = this.storage.get(m.thumbprint)), b = c.thumbprint !== a || c.protocol !== location.protocol, c.data && !b ? c.data : null
            },
            _initialize: function() {
                function c() {
                    e.add(b.isFunction(f) ? f() : f)
                }
                var d, e = this,
                    f = this.local;
                return d = this.prefetch ? this._loadPrefetch(this.prefetch) : a.Deferred().resolve(), f && d.done(c), this.transport = this.remote ? new g(this.remote) : null, this.initPromise = d.promise()
            },
            initialize: function(a) {
                return !this.initPromise || a ? this._initialize() : this.initPromise
            },
            add: function(a) {
                this.index.add(a)
            },
            get: function(a, c) {
                function d(a) {
                    var d = f.slice(0);
                    b.each(a, function(a) {
                        var c;
                        return c = b.some(d, function(b) {
                            return e.dupDetector(a, b)
                        }), !c && d.push(a), d.length < e.limit
                    }), c && c(e.sorter(d))
                }
                var e = this,
                    f = [],
                    g = !1;
                f = this.index.get(a), f = this.sorter(f).slice(0, this.limit), f.length < this.limit && this.transport && (g = this._getFromRemote(a, d)), g || (f.length > 0 || !this.transport) && c && c(f)
            },
            clear: function() {
                this.index.reset()
            },
            clearPrefetchCache: function() {
                this.storage && this.storage.clear()
            },
            clearRemoteCache: function() {
                this.transport && g.resetCache()
            },
            ttAdapter: function() {
                return b.bind(this.get, this)
            }
        }), e
    }(this);
    var j = {
        wrapper: '<span class="twitter-typeahead"></span>',
        dropdown: '<span class="tt-dropdown-menu"></span>',
        dataset: '<div class="tt-dataset-%CLASS%"></div>',
        suggestions: '<span class="tt-suggestions"></span>',
        suggestion: '<div class="tt-suggestion"></div>'
    }, k = {
            wrapper: {
                position: "relative",
                display: "block"
            },
            hint: {
                position: "absolute",
                top: "0",
                left: "0",
                borderColor: "transparent",
                boxShadow: "none"
            },
            input: {
                position: "relative",
                verticalAlign: "top",
                backgroundColor: "transparent"
            },
            inputWithNoHint: {
                position: "relative",
                verticalAlign: "top"
            },
            dropdown: {
                position: "absolute",
                top: "100%",
                left: "0",
                zIndex: "100",
                display: "none"
            },
            suggestions: {
                display: "block"
            },
            suggestion: {
                whiteSpace: "nowrap",
                cursor: "pointer"
            },
            suggestionChild: {
                whiteSpace: "normal"
            },
            ltr: {
                left: "0",
                right: "auto"
            },
            rtl: {
                left: "auto",
                right: " 0"
            }
        };
    b.isMsie() && b.mixin(k.input, {
        backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
    }), b.isMsie() && b.isMsie() <= 7 && b.mixin(k.input, {
        marginTop: "-1px"
    });
    var l = function() {
        function c(b) {
            b && b.el || a.error("EventBus initialized without el"), this.$el = a(b.el)
        }
        var d = "typeahead:";
        return b.mixin(c.prototype, {
            trigger: function(a) {
                var b = [].slice.call(arguments, 1);
                this.$el.trigger(d + a, b)
            }
        }), c
    }(),
        m = function() {
            function a(a, b, c, d) {
                var e;
                if (!c) return this;
                for (b = b.split(i), c = d ? h(c, d) : c, this._callbacks = this._callbacks || {}; e = b.shift();) this._callbacks[e] = this._callbacks[e] || {
                    sync: [],
                    async: []
                }, this._callbacks[e][a].push(c);
                return this
            }

            function b(b, c, d) {
                return a.call(this, "async", b, c, d)
            }

            function c(b, c, d) {
                return a.call(this, "sync", b, c, d)
            }

            function d(a) {
                var b;
                if (!this._callbacks) return this;
                for (a = a.split(i); b = a.shift();) delete this._callbacks[b];
                return this
            }

            function e(a) {
                var b, c, d, e, g;
                if (!this._callbacks) return this;
                for (a = a.split(i), d = [].slice.call(arguments, 1);
                    (b = a.shift()) && (c = this._callbacks[b]);) e = f(c.sync, this, [b].concat(d)), g = f(c.async, this, [b].concat(d)), e() && j(g);
                return this
            }

            function f(a, b, c) {
                function d() {
                    for (var d, e = 0; !d && e < a.length; e += 1) d = a[e].apply(b, c) === !1;
                    return !d
                }
                return d
            }

            function g() {
                var a;
                return a = window.setImmediate ? function(a) {
                    setImmediate(function() {
                        a()
                    })
                } : function(a) {
                    setTimeout(function() {
                        a()
                    }, 0)
                }
            }

            function h(a, b) {
                return a.bind ? a.bind(b) : function() {
                    a.apply(b, [].slice.call(arguments, 0))
                }
            }
            var i = /\s+/,
                j = g();
            return {
                onSync: c,
                onAsync: b,
                off: d,
                trigger: e
            }
        }(),
        n = function(a) {
            function c(a, c, d) {
                for (var e, f = [], g = 0; g < a.length; g++) f.push(b.escapeRegExChars(a[g]));
                return e = d ? "\\b(" + f.join("|") + ")\\b" : "(" + f.join("|") + ")", c ? new RegExp(e) : new RegExp(e, "i")
            }
            var d = {
                node: null,
                pattern: null,
                tagName: "strong",
                className: null,
                wordsOnly: !1,
                caseSensitive: !1
            };
            return function(e) {
                function f(b) {
                    var c, d;
                    return (c = h.exec(b.data)) && (wrapperNode = a.createElement(e.tagName), e.className && (wrapperNode.className = e.className), d = b.splitText(c.index), d.splitText(c[0].length), wrapperNode.appendChild(d.cloneNode(!0)), b.parentNode.replaceChild(wrapperNode, d)), !! c
                }

                function g(a, b) {
                    for (var c, d = 3, e = 0; e < a.childNodes.length; e++) c = a.childNodes[e], c.nodeType === d ? e += b(c) ? 1 : 0 : g(c, b)
                }
                var h;
                e = b.mixin({}, d, e), e.node && e.pattern && (e.pattern = b.isArray(e.pattern) ? e.pattern : [e.pattern], h = c(e.pattern, e.caseSensitive, e.wordsOnly), g(e.node, f))
            }
        }(window.document),
        o = function() {
            function c(c) {
                var e, f, h, i, j = this;
                c = c || {}, c.input || a.error("input is missing"), e = b.bind(this._onBlur, this), f = b.bind(this._onFocus, this), h = b.bind(this._onKeydown, this), i = b.bind(this._onInput, this), this.$hint = a(c.hint), this.$input = a(c.input).on("blur.tt", e).on("focus.tt", f).on("keydown.tt", h), 0 === this.$hint.length && (this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = b.noop), b.isMsie() ? this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function(a) {
                    g[a.which || a.keyCode] || b.defer(b.bind(j._onInput, j, a))
                }) : this.$input.on("input.tt", i), this.query = this.$input.val(), this.$overflowHelper = d(this.$input)
            }

            function d(b) {
                return a('<pre aria-hidden="true"></pre>').css({
                    position: "absolute",
                    visibility: "hidden",
                    whiteSpace: "pre",
                    fontFamily: b.css("font-family"),
                    fontSize: b.css("font-size"),
                    fontStyle: b.css("font-style"),
                    fontVariant: b.css("font-variant"),
                    fontWeight: b.css("font-weight"),
                    wordSpacing: b.css("word-spacing"),
                    letterSpacing: b.css("letter-spacing"),
                    textIndent: b.css("text-indent"),
                    textRendering: b.css("text-rendering"),
                    textTransform: b.css("text-transform")
                }).insertAfter(b)
            }

            function e(a, b) {
                return c.normalizeQuery(a) === c.normalizeQuery(b)
            }

            function f(a) {
                return a.altKey || a.ctrlKey || a.metaKey || a.shiftKey
            }
            var g;
            return g = {
                9: "tab",
                27: "esc",
                37: "left",
                39: "right",
                13: "enter",
                38: "up",
                40: "down"
            }, c.normalizeQuery = function(a) {
                return (a || "").replace(/^\s*/g, "").replace(/\s{2,}/g, " ")
            }, b.mixin(c.prototype, m, {
                _onBlur: function() {
                    this.resetInputValue(), this.trigger("blurred")
                },
                _onFocus: function() {
                    this.trigger("focused")
                },
                _onKeydown: function(a) {
                    var b = g[a.which || a.keyCode];
                    this._managePreventDefault(b, a), b && this._shouldTrigger(b, a) && this.trigger(b + "Keyed", a)
                },
                _onInput: function() {
                    this._checkInputValue()
                },
                _managePreventDefault: function(a, b) {
                    var c, d, e;
                    switch (a) {
                        case "tab":
                            d = this.getHint(), e = this.getInputValue(), c = d && d !== e && !f(b);
                            break;
                        case "up":
                        case "down":
                            c = !f(b);
                            break;
                        default:
                            c = !1
                    }
                    c && b.preventDefault()
                },
                _shouldTrigger: function(a, b) {
                    var c;
                    switch (a) {
                        case "tab":
                            c = !f(b);
                            break;
                        default:
                            c = !0
                    }
                    return c
                },
                _checkInputValue: function() {
                    var a, b, c;
                    a = this.getInputValue(), b = e(a, this.query), c = b ? this.query.length !== a.length : !1, b ? c && this.trigger("whitespaceChanged", this.query) : this.trigger("queryChanged", this.query = a)
                },
                focus: function() {
                    this.$input.focus()
                },
                blur: function() {
                    this.$input.blur()
                },
                getQuery: function() {
                    return this.query
                },
                setQuery: function(a) {
                    this.query = a
                },
                getInputValue: function() {
                    return this.$input.val()
                },
                setInputValue: function(a, b) {
                    this.$input.val(a), b ? this.clearHint() : this._checkInputValue()
                },
                resetInputValue: function() {
                    this.setInputValue(this.query, !0)
                },
                getHint: function() {
                    return this.$hint.val()
                },
                setHint: function(a) {
                    this.$hint.val(a)
                },
                clearHint: function() {
                    this.setHint("")
                },
                clearHintIfInvalid: function() {
                    var a, b, c, d;
                    a = this.getInputValue(), b = this.getHint(), c = a !== b && 0 === b.indexOf(a), d = "" !== a && c && !this.hasOverflow(), !d && this.clearHint()
                },
                getLanguageDirection: function() {
                    return (this.$input.css("direction") || "ltr").toLowerCase()
                },
                hasOverflow: function() {
                    var a = this.$input.width() - 2;
                    return this.$overflowHelper.text(this.getInputValue()), this.$overflowHelper.width() >= a
                },
                isCursorAtEnd: function() {
                    var a, c, d;
                    return a = this.$input.val().length, c = this.$input[0].selectionStart, b.isNumber(c) ? c === a : document.selection ? (d = document.selection.createRange(), d.moveStart("character", -a), a === d.text.length) : !0
                },
                destroy: function() {
                    this.$hint.off(".tt"), this.$input.off(".tt"), this.$hint = this.$input = this.$overflowHelper = null
                }
            }), c
        }(),
        p = function() {
            function c(c) {
                c = c || {}, c.templates = c.templates || {}, c.source || a.error("missing source"), c.name && !f(c.name) && a.error("invalid dataset name: " + c.name), this.query = null, this.highlight = !! c.highlight, this.name = c.name || b.getUniqueId(), this.source = c.source, this.displayFn = d(c.display || c.displayKey), this.templates = e(c.templates, this.displayFn), this.$el = a(j.dataset.replace("%CLASS%", this.name))
            }

            function d(a) {
                function c(b) {
                    return b[a]
                }
                return a = a || "value", b.isFunction(a) ? a : c
            }

            function e(a, c) {
                function d(a) {
                    return "<p>" + c(a) + "</p>"
                }
                return {
                    empty: a.empty && b.templatify(a.empty),
                    header: a.header && b.templatify(a.header),
                    footer: a.footer && b.templatify(a.footer),
                    suggestion: a.suggestion || d
                }
            }

            function f(a) {
                return /^[_a-zA-Z0-9-]+$/.test(a)
            }
            var g = "ttDataset",
                h = "ttValue",
                i = "ttDatum";
            return c.extractDatasetName = function(b) {
                return a(b).data(g)
            }, c.extractValue = function(b) {
                return a(b).data(h)
            }, c.extractDatum = function(b) {
                return a(b).data(i)
            }, b.mixin(c.prototype, m, {
                _render: function(c, d) {
                    function e() {
                        return p.templates.empty({
                            query: c,
                            isEmpty: !0
                        })
                    }

                    function f() {
                        function e(b) {
                            var c;
                            return c = a(j.suggestion).append(p.templates.suggestion(b)).data(g, p.name).data(h, p.displayFn(b)).data(i, b), c.children().each(function() {
                                a(this).css(k.suggestionChild)
                            }), c
                        }
                        var f, l;
                        return f = a(j.suggestions).css(k.suggestions), l = b.map(d, e), f.append.apply(f, l), p.highlight && n({
                            node: f[0],
                            pattern: c
                        }), f
                    }

                    function l() {
                        return p.templates.header({
                            query: c,
                            isEmpty: !o
                        })
                    }

                    function m() {
                        return p.templates.footer({
                            query: c,
                            isEmpty: !o
                        })
                    }
                    if (this.$el) {
                        var o, p = this;
                        this.$el.empty(), o = d && d.length, !o && this.templates.empty ? this.$el.html(e()).prepend(p.templates.header ? l() : null).append(p.templates.footer ? m() : null) : o && this.$el.html(f()).prepend(p.templates.header ? l() : null).append(p.templates.footer ? m() : null), this.trigger("rendered")
                    }
                },
                getRoot: function() {
                    return this.$el
                },
                update: function(a) {
                    function b(b) {
                        c.canceled || a !== c.query || c._render(a, b)
                    }
                    var c = this;
                    this.query = a, this.canceled = !1, this.source(a, b)
                },
                cancel: function() {
                    this.canceled = !0
                },
                clear: function() {
                    this.cancel(), this.$el.empty(), this.trigger("rendered")
                },
                isEmpty: function() {
                    return this.$el.is(":empty")
                },
                destroy: function() {
                    this.$el = null
                }
            }), c
        }(),
        q = function() {
            function c(c) {
                var e, f, g, h = this;
                c = c || {}, c.menu || a.error("menu is required"), this.isOpen = !1, this.isEmpty = !0, this.datasets = b.map(c.datasets, d), e = b.bind(this._onSuggestionClick, this), f = b.bind(this._onSuggestionMouseEnter, this), g = b.bind(this._onSuggestionMouseLeave, this), this.$menu = a(c.menu).on("click.tt", ".tt-suggestion", e).on("mouseenter.tt", ".tt-suggestion", f).on("mouseleave.tt", ".tt-suggestion", g), b.each(this.datasets, function(a) {
                    h.$menu.append(a.getRoot()), a.onSync("rendered", h._onRendered, h)
                })
            }

            function d(a) {
                return new p(a)
            }
            return b.mixin(c.prototype, m, {
                _onSuggestionClick: function(b) {
                    this.trigger("suggestionClicked", a(b.currentTarget))
                },
                _onSuggestionMouseEnter: function(b) {
                    this._removeCursor(), this._setCursor(a(b.currentTarget), !0)
                },
                _onSuggestionMouseLeave: function() {
                    this._removeCursor()
                },
                _onRendered: function() {
                    function a(a) {
                        return a.isEmpty()
                    }
                    this.isEmpty = b.every(this.datasets, a), this.isEmpty ? this._hide() : this.isOpen && this._show(), this.trigger("datasetRendered")
                },
                _hide: function() {
                    this.$menu.hide()
                },
                _show: function() {
                    this.$menu.css("display", "block")
                },
                _getSuggestions: function() {
                    return this.$menu.find(".tt-suggestion")
                },
                _getCursor: function() {
                    return this.$menu.find(".tt-cursor").first()
                },
                _setCursor: function(a, b) {
                    a.first().addClass("tt-cursor"), !b && this.trigger("cursorMoved")
                },
                _removeCursor: function() {
                    this._getCursor().removeClass("tt-cursor")
                },
                _moveCursor: function(a) {
                    var b, c, d, e;
                    if (this.isOpen) {
                        if (c = this._getCursor(), b = this._getSuggestions(), this._removeCursor(), d = b.index(c) + a, d = (d + 1) % (b.length + 1) - 1, -1 === d) return void this.trigger("cursorRemoved"); - 1 > d && (d = b.length - 1), this._setCursor(e = b.eq(d)), this._ensureVisible(e)
                    }
                },
                _ensureVisible: function(a) {
                    var b, c, d, e;
                    b = a.position().top, c = b + a.outerHeight(!0), d = this.$menu.scrollTop(), e = this.$menu.height() + parseInt(this.$menu.css("paddingTop"), 10) + parseInt(this.$menu.css("paddingBottom"), 10), 0 > b ? this.$menu.scrollTop(d + b) : c > e && this.$menu.scrollTop(d + (c - e))
                },
                close: function() {
                    this.isOpen && (this.isOpen = !1, this._removeCursor(), this._hide(), this.trigger("closed"))
                },
                open: function() {
                    this.isOpen || (this.isOpen = !0, !this.isEmpty && this._show(), this.trigger("opened"))
                },
                setLanguageDirection: function(a) {
                    this.$menu.css("ltr" === a ? k.ltr : k.rtl)
                },
                moveCursorUp: function() {
                    this._moveCursor(-1)
                },
                moveCursorDown: function() {
                    this._moveCursor(1)
                },
                getDatumForSuggestion: function(a) {
                    var b = null;
                    return a.length && (b = {
                        raw: p.extractDatum(a),
                        value: p.extractValue(a),
                        datasetName: p.extractDatasetName(a)
                    }), b
                },
                getDatumForCursor: function() {
                    return this.getDatumForSuggestion(this._getCursor().first())
                },
                getDatumForTopSuggestion: function() {
                    return this.getDatumForSuggestion(this._getSuggestions().first())
                },
                update: function(a) {
                    function c(b) {
                        b.update(a)
                    }
                    b.each(this.datasets, c)
                },
                empty: function() {
                    function a(a) {
                        a.clear()
                    }
                    b.each(this.datasets, a), this.isEmpty = !0
                },
                isVisible: function() {
                    return this.isOpen && !this.isEmpty
                },
                destroy: function() {
                    function a(a) {
                        a.destroy()
                    }
                    this.$menu.off(".tt"), this.$menu = null, b.each(this.datasets, a)
                }
            }), c
        }(),
        r = function() {
            function c(c) {
                var e, f, g;
                c = c || {}, c.input || a.error("missing input"), this.isActivated = !1, this.autoselect = !! c.autoselect, this.minLength = b.isNumber(c.minLength) ? c.minLength : 1, this.$node = d(c.input, c.withHint), e = this.$node.find(".tt-dropdown-menu"), f = this.$node.find(".tt-input"), g = this.$node.find(".tt-hint"), f.on("blur.tt", function(a) {
                    var c, d, g;
                    c = document.activeElement, d = e.is(c), g = e.has(c).length > 0, b.isMsie() && (d || g) && (a.preventDefault(), a.stopImmediatePropagation(), b.defer(function() {
                        f.focus()
                    }))
                }), e.on("mousedown.tt", function(a) {
                    a.preventDefault()
                }), this.eventBus = c.eventBus || new l({
                    el: f
                }), this.dropdown = new q({
                    menu: e,
                    datasets: c.datasets
                }).onSync("suggestionClicked", this._onSuggestionClicked, this).onSync("cursorMoved", this._onCursorMoved, this).onSync("cursorRemoved", this._onCursorRemoved, this).onSync("opened", this._onOpened, this).onSync("closed", this._onClosed, this).onAsync("datasetRendered", this._onDatasetRendered, this), this.input = new o({
                    input: f,
                    hint: g
                }).onSync("focused", this._onFocused, this).onSync("blurred", this._onBlurred, this).onSync("enterKeyed", this._onEnterKeyed, this).onSync("tabKeyed", this._onTabKeyed, this).onSync("escKeyed", this._onEscKeyed, this).onSync("upKeyed", this._onUpKeyed, this).onSync("downKeyed", this._onDownKeyed, this).onSync("leftKeyed", this._onLeftKeyed, this).onSync("rightKeyed", this._onRightKeyed, this).onSync("queryChanged", this._onQueryChanged, this).onSync("whitespaceChanged", this._onWhitespaceChanged, this), this._setLanguageDirection()
            }

            function d(b, c) {
                var d, f, h, i;
                d = a(b), f = a(j.wrapper).css(k.wrapper), h = a(j.dropdown).css(k.dropdown), i = d.clone().css(k.hint).css(e(d)), i.val("").removeData().addClass("tt-hint").removeAttr("id name placeholder").prop("disabled", !0).attr({
                    autocomplete: "off",
                    spellcheck: "false"
                }), d.data(g, {
                    dir: d.attr("dir"),
                    autocomplete: d.attr("autocomplete"),
                    spellcheck: d.attr("spellcheck"),
                    style: d.attr("style")
                }), d.addClass("tt-input").attr({
                    autocomplete: "off",
                    spellcheck: !1
                }).css(c ? k.input : k.inputWithNoHint);
                try {
                    !d.attr("dir") && d.attr("dir", "auto")
                } catch (l) {}
                return d.wrap(f).parent().prepend(c ? i : null).append(h)
            }

            function e(a) {
                return {
                    backgroundAttachment: a.css("background-attachment"),
                    backgroundClip: a.css("background-clip"),
                    backgroundColor: a.css("background-color"),
                    backgroundImage: a.css("background-image"),
                    backgroundOrigin: a.css("background-origin"),
                    backgroundPosition: a.css("background-position"),
                    backgroundRepeat: a.css("background-repeat"),
                    backgroundSize: a.css("background-size")
                }
            }

            function f(a) {
                var c = a.find(".tt-input");
                b.each(c.data(g), function(a, d) {
                    b.isUndefined(a) ? c.removeAttr(d) : c.attr(d, a)
                }), c.detach().removeData(g).removeClass("tt-input").insertAfter(a), a.remove()
            }
            var g = "ttAttrs";
            return b.mixin(c.prototype, {
                _onSuggestionClicked: function(a, b) {
                    var c;
                    (c = this.dropdown.getDatumForSuggestion(b)) && this._select(c)
                },
                _onCursorMoved: function() {
                    var a = this.dropdown.getDatumForCursor();
                    this.input.setInputValue(a.value, !0), this.eventBus.trigger("cursorchanged", a.raw, a.datasetName)
                },
                _onCursorRemoved: function() {
                    this.input.resetInputValue(), this._updateHint()
                },
                _onDatasetRendered: function() {
                    this._updateHint()
                },
                _onOpened: function() {
                    this._updateHint(), this.eventBus.trigger("opened")
                },
                _onClosed: function() {
                    this.input.clearHint(), this.eventBus.trigger("closed")
                },
                _onFocused: function() {
                    this.isActivated = !0, this.dropdown.open()
                },
                _onBlurred: function() {
                    this.isActivated = !1, this.dropdown.empty(), this.dropdown.close()
                },
                _onEnterKeyed: function(a, b) {
                    var c, d;
                    c = this.dropdown.getDatumForCursor(), d = this.dropdown.getDatumForTopSuggestion(), c ? (this._select(c), b.preventDefault()) : this.autoselect && d && (this._select(d), b.preventDefault())
                },
                _onTabKeyed: function(a, b) {
                    var c;
                    (c = this.dropdown.getDatumForCursor()) ? (this._select(c), b.preventDefault()) : this._autocomplete(!0)
                },
                _onEscKeyed: function() {
                    this.dropdown.close(), this.input.resetInputValue()
                },
                _onUpKeyed: function() {
                    var a = this.input.getQuery();
                    this.dropdown.isEmpty && a.length >= this.minLength ? this.dropdown.update(a) : this.dropdown.moveCursorUp(), this.dropdown.open()
                },
                _onDownKeyed: function() {
                    var a = this.input.getQuery();
                    this.dropdown.isEmpty && a.length >= this.minLength ? this.dropdown.update(a) : this.dropdown.moveCursorDown(), this.dropdown.open()
                },
                _onLeftKeyed: function() {
                    "rtl" === this.dir && this._autocomplete()
                },
                _onRightKeyed: function() {
                    "ltr" === this.dir && this._autocomplete()
                },
                _onQueryChanged: function(a, b) {
                    this.input.clearHintIfInvalid(), b.length >= this.minLength ? this.dropdown.update(b) : this.dropdown.empty(), this.dropdown.open(), this._setLanguageDirection()
                },
                _onWhitespaceChanged: function() {
                    this._updateHint(), this.dropdown.open()
                },
                _setLanguageDirection: function() {
                    var a;
                    this.dir !== (a = this.input.getLanguageDirection()) && (this.dir = a, this.$node.css("direction", a), this.dropdown.setLanguageDirection(a))
                },
                _updateHint: function() {
                    var a, c, d, e, f, g;
                    a = this.dropdown.getDatumForTopSuggestion(), a && this.dropdown.isVisible() && !this.input.hasOverflow() ? (c = this.input.getInputValue(), d = o.normalizeQuery(c), e = b.escapeRegExChars(d), f = new RegExp("^(?:" + e + ")(.+$)", "i"), g = f.exec(a.value), g ? this.input.setHint(c + g[1]) : this.input.clearHint()) : this.input.clearHint()
                },
                _autocomplete: function(a) {
                    var b, c, d, e;
                    b = this.input.getHint(), c = this.input.getQuery(), d = a || this.input.isCursorAtEnd(), b && c !== b && d && (e = this.dropdown.getDatumForTopSuggestion(), e && this.input.setInputValue(e.value), this.eventBus.trigger("autocompleted", e.raw, e.datasetName))
                },
                _select: function(a) {
                    this.input.setQuery(a.value), this.input.setInputValue(a.value, !0), this._setLanguageDirection(), this.eventBus.trigger("selected", a.raw, a.datasetName), this.dropdown.close(), b.defer(b.bind(this.dropdown.empty, this.dropdown))
                },
                open: function() {
                    this.dropdown.open()
                },
                close: function() {
                    this.dropdown.close()
                },
                setVal: function(a) {
                    this.isActivated ? this.input.setInputValue(a) : (this.input.setQuery(a), this.input.setInputValue(a, !0)), this._setLanguageDirection()
                },
                getVal: function() {
                    return this.input.getQuery()
                },
                destroy: function() {
                    this.input.destroy(), this.dropdown.destroy(), f(this.$node), this.$node = null
                }
            }), c
        }();
    ! function() {
        var c, d, e;
        c = a.fn.typeahead, d = "ttTypeahead", e = {
            initialize: function(c, e) {
                function f() {
                    var f, g, h = a(this);
                    b.each(e, function(a) {
                        a.highlight = !! c.highlight
                    }), g = new r({
                        input: h,
                        eventBus: f = new l({
                            el: h
                        }),
                        withHint: b.isUndefined(c.hint) ? !0 : !! c.hint,
                        minLength: c.minLength,
                        autoselect: c.autoselect,
                        datasets: e
                    }), h.data(d, g)
                }
                return e = b.isArray(e) ? e : [].slice.call(arguments, 1), c = c || {}, this.each(f)
            },
            open: function() {
                function b() {
                    var b, c = a(this);
                    (b = c.data(d)) && b.open()
                }
                return this.each(b)
            },
            close: function() {
                function b() {
                    var b, c = a(this);
                    (b = c.data(d)) && b.close()
                }
                return this.each(b)
            },
            val: function(b) {
                function c() {
                    var c, e = a(this);
                    (c = e.data(d)) && c.setVal(b)
                }

                function e(a) {
                    var b, c;
                    return (b = a.data(d)) && (c = b.getVal()), c
                }
                return arguments.length ? this.each(c) : e(this.first())
            },
            destroy: function() {
                function b() {
                    var b, c = a(this);
                    (b = c.data(d)) && (b.destroy(), c.removeData(d))
                }
                return this.each(b)
            }
        }, a.fn.typeahead = function(a) {
            return e[a] ? e[a].apply(this, [].slice.call(arguments, 1)) : e.initialize.apply(this, arguments)
        }, a.fn.typeahead.noConflict = function() {
            return a.fn.typeahead = c, this
        }
    }()
}(window.jQuery);