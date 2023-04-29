import download from "download-git-repo"
import { program } from "commander"
import inquirer from "inquirer"

const templates = [
  {
    name: "Template A",
    value: "Robby6Strings/cinnabun-csr-template",
  },
  {
    name: "Template B",
    value: "your-username/your-repo#template-b",
  },
]

const defaultDir = "my-new-app"

program
  .command("init")
  .description("Create a new project from your-package.")
  .option("-t, --template <template>", "Template to use")
  .option("-d, --dest <dest>", "Destination directory")
  .action(async ({ template, dest }) => {
    // console.log("Installing your-package...")
    // await execAsync(`npm install --save your-package`)
    // console.log("your-package installed.")

    if (!template) {
      const { selectedTemplate } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedTemplate",
          message: "Choose a template:",
          choices: templates,
        },
      ])
      template = selectedTemplate
    }
    const { selectedDest } = await inquirer.prompt([
      {
        type: "input",
        name: "dest",
        message: "Destination directory:",
        default: defaultDir,
      },
    ])
    dest = selectedDest ?? defaultDir

    console.log("template: ", template)
    console.log("dest: ", dest)

    console.log(`Downloading project template '${template}'...`)
    await new Promise((resolve, reject) => {
      download(template, dest, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
    console.log("Project template downloaded.")
  })

program.parse(process.argv)
