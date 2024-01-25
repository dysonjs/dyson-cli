import path from 'node:path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import Handlebars from 'handlebars';
import { kebabCase } from 'lodash';
import { glob } from 'fast-glob';

import { BASE_DIR, PACKAGES_DIR, TEMPLATE_DIR, log } from './helpers';

type Answers = {
  dir: string;
  name: string;
  desc?: string;
};

async function startup() {
  const answers = await inquirer.prompt<Answers>([
    {
      name: 'dir',
      type: 'list',
      message: 'Where would you like to add your package?',
      choices: PACKAGES_DIR,
      default: PACKAGES_DIR[0],
    },
    {
      name: 'name',
      type: 'input',
      message: 'Input the name of your package?',
      default: 'demo',
      transformer(input: string) {
        return kebabCase(input);
      },
      validate(name: string, answer: Answers) {
        const isExists = fs.existsSync(path.join(BASE_DIR, answer.dir, name));
        if (isExists) {
          return 'Folder is existing!';
        }
        return true;
      },
    },
    {
      name: 'desc',
      type: 'input',
      message: 'Input the description of the package',
      default: '',
    },
  ]);

  // Copy template files to destination
  const templateDir = path.join(TEMPLATE_DIR, 'package');
  const destDir = path.join(BASE_DIR, answers.dir, answers.name);
  await fs.copy(templateDir, destDir);

  // Compile the files which is suffixed with '*.hbs'
  const files = await glob(`${destDir}/**/*.hbs`);
  const promises = files.map((filepath) => {
    return new Promise(async (resolve) => {
      const content = await fs.readFile(filepath, 'utf-8');
      const newFileContent = Handlebars.compile(content)(answers);
      const newFilePath = filepath.replace('.hbs', '');
      await fs.ensureFile(newFilePath);
      await fs.writeFile(newFilePath, newFileContent, { encoding: 'utf-8' });
      await fs.remove(filepath);
      resolve(true);
    });
  });
  await Promise.all(promises);

  log.success('Add package successfully!');
}

startup();
