import { WorkspaceDefinition } from '@schematics/angular/utility/workspace';

import { Schema } from './schema';

export function determineProject(
  workspace: WorkspaceDefinition,
  options: Schema,
) {
  if (!options.project) {
    options.project = workspace.extensions['defaultProject'] as string;
    const project = workspace.projects.get(options.project);

    if (!project)
      throw new Error(
        [
          '✘ No default project configured.',
          "Specify a project with '--project <project-name>'.",
          'Available projects:' +
            Array.from(workspace.projects.keys()).sort().join(', '),
        ].join('\n'),
      );
    return project;
  }

  const project = workspace.projects.get(options.project);
  if (!project)
    throw new Error(
      [
        '✘ Project not found.',
        'Available projects: ' +
          Array.from(workspace.projects.keys()).sort().join(', '),
      ].join('\n'),
    );

  return project;
}
