function inDebugMode() {
    return localStorage.getItem(window.location.href + "_debug") === "true";
}

function getBreakPoint() {
    return localStorage.getItem(window.location.href + "_breakpoint") * 1;
}

function createBreakPoint() {
    var marker = document.createElement("div");
    marker.className = "breakpoint";
    marker.style.color = "#822";
    marker.innerHTML = ">";
    return marker;
}

(function ($) {

    $.fn.debugger = function (options) {
        var opts = $.extend({}, $.fn.debugger.defaults, options);

        var hightLight = function (selector, color, fontWeight) {
            $(selector).css("color", color).css("font-weight", fontWeight);
        };

        var showStep = function (showStep, show) {
            hightLight("[data-step]:not(.lineselect)", "black", "normal");
            hightLight(".message[data-step]", "green", "normal");
            hightLight("[data-step=" + showStep + "]", "red", "bold");

            $("[data-step]:not(.lineno)").each(function () {
                var step = $(this).data("step");
                if (step === "S") step = 1;
                if (showStep > step) {
                    if ($(this).hasClass("message")) {
                        $(this).css("display", "list-item");
                    } else if ($(this).hasClass("annotation")) {
                        $(this).css("display", show ? "inline" : "none");
                    } else {
                        $(this).css("display", "inline");
                    }
                } else if (showStep == step) {
                    $(this).css("display", "inline");
                } else {
                    $(this).css("display", "none");
                }

            });
        }

        var showAll = function () {
            return $(opts.allAnnotations).is(":checked");
        };

        return this.each(function () {

            $(this).linedtextarea();

            var breakPoint = getBreakPoint();

            if (breakPoint > 0) {
                var breakLine = $(".lineno[data-step=" + breakPoint + "]");
                breakLine.first().prepend(createBreakPoint());
            }

            $(".lineno").on("click", function () {

                var hasBreakPoint = $(this).find(".breakpoint").length;

                var breakpoints = $(".breakpoint");
                if (breakpoints.length) {
                    breakpoints.remove();
                    localStorage.removeItem(window.location.href + "_breakpoint");

                }

                if (!hasBreakPoint) {
                    $(this).prepend(createBreakPoint());
                    localStorage.setItem(window.location.href + "_breakpoint", $(this).data("step"));
                }
            });


            if (inDebugMode()) {
                var error = localStorage.getItem(window.location.href + "_errors");
                var stepper = $(opts.stepper);

                var lastLine = stepper.prop("max");
                if (error != null) {
                    var line = lastLine = error.split(",")[0] * 1 + 1;
                    hightLight("[data-step=" + line + "]", "red", "bold");
                    $(".lineno[data-step=" + line + "]").addClass("lineselect");
                    stepper.val(line);
                }

                $(opts.allAnnotations).on("change", function () {
                    var step = stepper.val() > 0 ? stepper.val() : 0;
                    stepper.val(step);
                    showStep(step, $(this).is(":checked"));
                });

                stepper.on("change keyup", function () {
                    var step = $(this).val() === "" ? -1 : $(this).val();
                    showStep(step, showAll());
                });

                $("[data-step]:not(.lineno)").on("click", function () {
                    var step = $(this).data("step");
                    if (lastLine >= step) {
                        stepper.val(step);
                        showStep(step, showAll());
                    }
                });

                if (!error) {
                    var max = stepper.prop("max");
                    stepper.val((breakPoint > 0 && breakPoint <= max) ? breakPoint : max).trigger("change");
                }
            }
        });
    }

    $.fn.debugger.defaults = {
        stepper: "#stepper",
        allAnnotations: "#showAll"
    };
})(jQuery);