(function($) {

	$.fn.debugger = function(options) {
		var opts = $.extend({}, $.fn.debugger.defaults, options);      

        var showStep = function(showStep,hidePrevious){
            $("[data-step]").css("color", "black").css("font-weight", "normal");
            $(".message[data-step]").css("color", "green").css("font-weight", "normal");	
            $("[data-step="+showStep+"]").css("color", "red").css("font-weight", "bold");
       
            $("[data-step]:not(.lineno)").each(function(){
                    var step = $(this).data("step");
                    if(step === "S") step = 0;                
                    if( showStep > step){
                        if($(this).hasClass("message")){
                            $(this).css("display", "list-item");
                        }
                        else if($(this).hasClass("annotation")){
                            $(this).css("display", hidePrevious ? "none": "inline");
                        }
                        else{
                            $(this).css("display", "inline");
                        }					
                    }else if( showStep == step){
                        $(this).css("display", "inline");
                    }
                    else{
                        $(this).css("display", "none");
                    }
                                
            });
        }

        var hidePrevious = function(){
            return $(opts.hidePreviousCheckbox).is(":checked");
        };

        return this.each(function() {
            
            $(this).linedtextarea();

            if(inDebugMode()){
                var stepper = $(opts.stepper);

                $(opts.hidePreviousCheckbox).on("change",function(){
                    var step = stepper.val() > 0 ? stepper.val() : 0;
                    stepper.val(step);
                    showStep(step, $(this).is(":checked"));
                });

                stepper.on("change keyup", function(){
                    var step = $(this).val() === "" ? -1 : $(this).val();		
                    showStep(step, hidePrevious());
                });
            
                $("[data-step]").on("click",function(){
                    var step = $(this).data("step");
                    if(stepper.prop("max") >= step){
                        stepper.val(step);
                        showStep(step, hidePrevious());
                    }
                });
            }
        });
    }

    $.fn.debugger.defaults = {
        stepper: "#stepper",
        hidePreviousCheckbox: "#hidePrev"
    };
})(jQuery);
