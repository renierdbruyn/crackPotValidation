## crackPotValidation
#### Developed by a genuine crackpot for Bootstrap 4!
---
### Init
```javascript
$('form[name="someAwesomeForm"]').processForm({
  validationUrl: 'VALIDATION PUT URL',
  validationExc: ['email'], // excludes elements from server side val
  submitUrl: 'SUBMIT POST URL',
  autocompleteOff: true,
  stopProp: true,
  validationMethods: {
    email: function(ele){
        //sample local validation method
        // ele.value and ele.name are available
        if (ele.value.length < 10){
          return [false, 'Email address not valid'];
        }
      }
    }
  }
});
```
