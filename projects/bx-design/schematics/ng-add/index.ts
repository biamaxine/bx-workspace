import { Schema } from './schema';
import { Tree, SchematicContext } from '@angular-devkit/schematics';
import {
  getWorkspace,
  ProjectDefinition,
} from '@schematics/angular/utility/workspace';
import { addRootImport } from '@schematics/angular/utility';

export function ngAdd(options: Schema) {
  return async (tree: Tree, context: SchematicContext) => {
    // 1. Validate the Workspace
    if (!tree.exists('angular.json')) {
      throw new Error(
        "❌ Workspace Angular not found (missing file 'angular.json').\n" +
          'Run this command inside an Angular Project.',
      );
    }

    // 2. Load Workspace
    const workspace = await getWorkspace(tree);
    const availableProjects = Array.from(workspace.projects.keys()).sort();
    let project: ProjectDefinition | undefined;

    // 3. Determine the Project
    if (!options.project) {
      options.project = workspace.extensions['defaultProject'] as string;
      project = workspace.projects.get(options.project);

      if (!project)
        throw new Error(
          [
            '❌ No default project configured.',
            "Specify a project with '--project <project-name>'.",
            'Available projects:' + availableProjects.join(', '),
          ].join('\n'),
        );
    } else {
      project = workspace.projects.get(options.project);
      if (!project)
        throw new Error(
          [
            '❌ Project not found.',
            `Available projects: ${availableProjects.join(', ')}`,
          ].join('\n'),
        );
    }

    // 4. Main run
    context.logger.info(
      `📦 Adding the BxDesign library to the project: ${options.project}`,
    );
    return addRootImport(
      options.project,
      ({ code, external }) => code`${external('BxDesignModule', 'bx-design')}`,
    );
  };
}
