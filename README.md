# Installation

````bash
npm install elasticio-cli -g
````

In order to check if the installation was successful, just type in your terminal:

````bash
$ elasticio
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

Executing a component on your local machine is accomplished by ``elasticio cmp:exec`` command. If you execute that command you should see following output:

````bash
elasticio cmp:process

  Usage: elasticio [options] [undefined]

  Options:

    -h, --help            output usage information
    -p, --path <path>     Path to the component file to be executed. Absolute or relative.
    -f, --function [key]  Function name to be executed
    -x, --fixture [key]   Key of the fixture providing configuration for the execution
````

The most important parameter is ``-p`` which tells the command where to finde the component's node.js module. This files is expeted to export the ``process`` function to be executed. 

The ``process(msg, cfg)`` function takes at least 2 parameters:

* msg: the message to be process by the component
* cfg: component's configuration

In order to execute your component, we need to know what parameters to pass to its ``process`` function. This is what the fixtures are for. 

Fixtures are defined in a file ``test/fixture.json`` whereby the ``test`` folder is is expected to be located next to ``component.json`` file. Here is an example of a ``fixture.json`` file. called ``fixtures``.

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
"access_token":"{{google_access_token}}"
````

The variable values can be store in a file named _elastic.json_ which is located from your user's home directory. For example on my Mac the file is located at _/Users/igor/elastic.json_. This file is again a JSON file containing all the secret values. Soon we will support encryption.

````json
{
    "google_calendar_id":"fubar@acme.org",
    "google_refresh_token":"very-secret-refresh-token",
    "google_access_token":"very-secret-access-token"
}
````

Now that you have a fixture prepared, you can execute your component as shown below.

````bash
  elasticio cmp:process -p lib/hello_world/hello.js -x success
````

The command takes 2 arguments:
* -p: path to the component's file exporting the _process_ function
* -x: fixture name to be used for component execution
