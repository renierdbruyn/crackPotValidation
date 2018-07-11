function castJson(arr) {
    $json_object = {};

    for (var x = 0; x < arr.length; x++) {
        if (arr[x].type == 'checkbox'){
          $json_object[arr[x].name] = arr[x].checked;
          continue;
        }
        $json_object[arr[x].name] = arr[x].value;
    };

    return $json_object;
};

(function($) {
    $.fn.processForm = function(settings) {

      $form = $(this);
      $formElements = $form.find('input, select, textarea');
      $formData = castJson($formElements);
      $errors = 0;

      function updateFormVars(fObj) {
        $form = $(fObj);
        $formElements = $form.find('input, select, textarea');
        $formData = castJson($formElements);
        $errors = 0;
      }

      $form.submit(function(e){
        e.preventDefault();
        e.stopPropagation();
      })

      if (settings.autocompleteOff) {
        $form.attr('autocomplete', 'off');
      }

      $form.find(':input').on('change input', function() {
        updateFormVars($form);
        clean_up_errors();

        run_local_validation();

        if ($errors == 0) {
          run_remote_validation();
        }

        if ($errors == 0) {
          unlock_submit();
        }

      });

      function lock_submit() {
        $form.find('button[type="submit"]').attr("disabled", true);
        $form.find('button[type="submit"]').html('Locked');
        $form.find('button[type="submit"]').removeClass('btn-outline-primary').addClass('btn-outline-danger');
      }

      function unlock_submit() {
        $form.find('button[type="submit"]').attr("disabled", false);
        $form.find('button[type="submit"]').html('Submit');
        $form.find('button[type="submit"]').removeClass('btn-outline-danger').addClass('btn-outline-primary');
      }

      function clean_up_errors() {
        $('div').each(function(ind, ele) {
          if(ele.className == 'invalid-feedback') {
            ele.remove();
          }
        });

        $formElements.each(function(ind, ele) {
          if(ele.classList.contains('is-invalid')) {
            ele.className = "form-control form-control-lg";
          }

           $(ele).addClass('is-valid');
        })
      }

      function throw_bs_error(test_result) {
        $.each($formElements, function(key, ele) {
            if (ele.name == test_result[2]) {
              errorMessage = document.createElement("div");
              $(errorMessage).text(test_result[1]);
              errorMessage.classList.add('invalid-feedback');

              ele.classList.add('is-invalid');
              ele.after(errorMessage);

              $errors++;
              lock_submit();
            }
        });
      }

      function loop_elements(val_method, val_funct, val_name, excl=[]) {
        for (x in $formData) {
          if (val_method == 'remote') {
            if (!excl.includes(x) && x == val_name){
              result = val_funct({name:x, value:$formData[x]});
              if (result) {
                if (result[0] == false) {
                  result.push(x);
                  throw_bs_error(result);
                  break;
                }
              }
            }
          }
          else if (val_method == 'local') {
            if (x == val_name) {
              result = val_funct({name:x, value:$formData[x]});
              if (result) {
                if (result[0] == false) {
                  result.push(x);
                  throw_bs_error(result);
                  break;
                }
              }
            }
          }
        }
      }

      function run_local_validation(){
        if (Object.keys(settings.validationMethods).length > 0) {
          $.each(settings.validationMethods, function(key, obj){
            validate_local_test = loop_elements('local', obj, key);
            if (validate_local_test) {
              if (validate_local_test[0] == false){
                throw_bs_error(validate_local_test);
              }
            }
          });
        }
      }

    function run_remote_validation() {
      for(var eN2 = 0; eN2 < $formElements.length; eN2++) {
        excludes = (settings.validationExc) ? settings.validationExc : [];
        loop_elements('remote', remote_validation, $formElements[eN2].name, excl=excludes);
      }
    }

    function remote_validation(element) {
      var xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 409) {
            outcome = [false, JSON.parse(xhttp.responseText)['response'][element.name]];
          }
      };

      xhttp.open("PUT", settings.validationUrl, false);
      xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhttp.send(JSON.stringify({name:element.name, value:element.value}));

      return outcome;
    }

  }
})(jQuery);
