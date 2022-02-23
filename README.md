# ITMO Web Course Project
## Software Shop

### Installation
* Before you start, create the configuration file `server/config.json`
  (see an example `server/config.json.default`)

* If your postgres user **is not** a superuser, install manually extension `uuid-ossp` for your database. Otherwise, skip this step.

* Open a terminal in the root directory of the project and run:

  `npm install`
* After all modules installed, run:
  
  `./start.sh`
* To stop server, run:

  `./stop.sh`
* Logs will be stored in `log.txt`
