import { HttpController, HttpOperation } from '@opra/common';
import { Note } from 'customer-mongo/models';

@HttpController({
  description: 'Files resource',
})
export class FilesController {
  static lastPost: any;

  @(HttpOperation.POST()
    .MultipartContent({}, config => {
      config.Field('notes', { required: true });
      config.Field('notes2');
      config.File(/^file\d+/, { contentType: 'text/*' });
    })
    .Response(200, { type: Note }))
  async post(context: HttpOperation.Context) {
    const reader = await context.getMultipartReader();
    const parts = await reader.getAll();
    FilesController.lastPost = parts;
    return new Note({
      title: 'title',
      text: parts[0].field,
    });
  }
}
