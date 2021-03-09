(function($) {

	$.fn.debugger = function(options) {
		var opts = $.extend({}, $.fn.debugger.defaults, options);      

        var showStep = function(showStep){
            $("[data-step]").css("color", "black").css("font-weight", "normal");
            $(".message[data-step]").css("color", "green").css("font-weight", "normal");	
            $("[data-step="+showStep+"]").css("color", "red").css("font-weight", "bold");
        
            $("[data-step]:not(.lineno)").each(function(){
                    var step = $(this).data("step");
                    if(step === "S") step = 0;
                    if( showStep > step){
                        if($(this).hasClass("message")){
                            $(this).css("display", "list-item");
                        }else{
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

        return this.each(function() {
            $(this).linedtextarea();

            var debug = inDebugMode();
            if(debug){
                var stepper = $(opts.stepper);

                stepper.on("change keyup", function(){
                    var currentStep = $(this).val() === "" ? -1 : $(this).val();		
                    showStep(currentStep);
                });
            
                $("[data-step]").on("click",function(){
                    var step = $(this).data("step");             
                    if(stepper.prop("max") >= step){
                        stepper.val(step);
                        showStep(step);
                    }
                });
            }
        });
    }

    $.fn.debugger.defaults = {
        stepper: "#stepper"
    };
})(jQuery);
