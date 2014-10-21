# Installation

````bash
npm install elasticio-cli -g
````

In order to check if the installation was successful, just type in your terminal:

````bash
elasticio
````
You should see an output like this:

````bash
$ elasticio

  elastic.io tools 0.0.5

  Options:

  cmp:process <options>
  cmp:exec <options>
  cmp:create
  lib:create
  oauth2 <options>
````

# Executing component's process function

Now let me show you how to execute your component. This is accomplished with test fixtures. What is a fixture? A fixture is just a JSON object just is used to provide values for component's _process_ function inside a test.

Now let's create a test fixture by creating a **test** sub-folder in component's folder and placing a file named **fixture.json** in it, such as shown in the following example. 

````json
{
    "fixtures":{
        "success":{
            "msg":{
                "headers":{},
                "body":{}
            },
            "cfg":{
                "calendarId":"{{google_calendar_id}}",
                "oauth":{
                    "expires_in":3600,
                    "token_type":"Bearer",
                    "refresh_token":"{{google_refresh_token}}",
                    "access_token":"{{google_access_token}}"
                }
            }
        }
    }
}
````

The content of the file is a JSON object with a single key ``fixtures`` which contains named fixtures. Each fixture defines arguments to be passed to component's _process_ function: a message and configuration objects. 

The only fixture in example above is named _success_. Please note that the  component's configuration may contain sensible data, such as API keys or OAuth tokens. Such data must not be placed inside fixture files because you will push them to your version control system, such as GitHub. Instead they should be replaced by variables using the [Handlebars](http://handlebarsjs.com/) syntax:

````
{{variable}}
````

The variable values can be store in a file named _elastic.json_ which is located from your user's home directory. For example on my Mac the file is located at _/Users/igor/elastic.json_. This file is again a JSON file containing all the secret values. Soon we will support encryption.

````json
{
    "google_calendar_id":"fubar@acme.org",
    "google_refresh_token":"very-secret-refresh-token",
    "google_access_token":"very-secret-access-token",
}
````

Now that you have a fixture prepared, you can execute your component as shown below.

````bash
  elasticio cmp:process -p lib/hello_world/hello.js -x success
````

The command takes 2 arguments:
* -p: path to the component's file exporting the _process_ function
* -x: fixture name to be used for component execution
