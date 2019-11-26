# Elasticio CLI Tool
## Installation

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

     elasticio 1.2.0 

   USAGE

     elasticio <command> [options]

   COMMANDS

     cmp:process <path> [fixture]           Run the process function of an action/trigger
     cmp:exec <path> [func] [fixture]       Run component actions
     help <command>                         Display help for a specific command

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
````

## Running Actions/Triggers locally

Executing an action/trigger process on your local machine is accomplished by ``elasticio cmp:process`` command. For any command, running it with the `-h` or `--help` command provides instructions on how to run it. For example, if you execute that command `elasticio cmp:process -h` you should see following output:

````bash
elasticio 1.2.0 

   USAGE

     elasticio cmp:process <path> [fixture]

   ARGUMENTS

     <path>         Path to file with process function      required 
     [fixture]      Fixture to run against                  optional 
````

The only required argument is the `path`, which tells the command where to find the component's action/trigger. This file is expected to export the ``process`` function to be executed.

## Fixtures
Fixtures are used in testing code as a location to store test instances within a codebase.

For example, the ``process(msg, cfg)`` function takes at least 2 parameters:

* msg: the message to be process by the component
* cfg: component's configuration

In order to execute your component, we need to know what parameters to pass to its ``process`` function. This is what the fixtures are for.

Fixtures are defined in a file ``test/fixture.json`` whereby the ``test`` folder is is expected to be located in the root of the component directory, i.e. in the same location as `component.json`.

A `fixtures.json` file has a root fixtures object, and then one or more defined fixtures. Below is an example file:

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
  elasticio cmp:process lib/hello_world/hello.js success
````

The command takes 2 arguments:
* path to the component's file exporting the _process_ function
* fixture name to be used for component execution (optional)

## Template Fixture File

```json
{
  "fixtures": {
    "example": {
      "cfg": {
        ...
      },
      "msg": {
        "body": {
          ...
        }
      }
    },
    "example2": {
      "cfg": {
        ...
      },
      "msg": {
        ...
      }
    }
  }
}
```
