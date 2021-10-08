# clipboard
Pure Jquery based personal clipboard to share content easily
# setup
Works as a pure browser solution, does not require web hosting. 

Can be used as a whole. But can create your own firebase database and change the below code with your firebase config

```javascript
 var config = {
            apiKey: "AIzaSyAyPo6J5KAweSH4cewqAcXZM2VD0Q4jKpM",
            authDomain: "clipboard-18cfa.firebaseapp.com",
            databaseURL: "https://clipboard-18cfa.firebaseio.com",
            projectId: "clipboard-18cfa",
            storageBucket: "",
            messagingSenderId: "163705736522"
        };
```

and change the Rules in clipboard database to ( keep in mind it makes it open to all)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
can use some authentication to keep it secure

