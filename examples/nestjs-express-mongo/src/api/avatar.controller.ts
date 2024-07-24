import { HttpController, HttpOperation } from '@opra/common';

@HttpController({
  path: 'avatar',
})
export class AtavarController {
  @(HttpOperation.POST().MultipartContent({}, content => {
    content.Field('name', { type: String, required: true });
    content.Field('metadata', { type: 'object' });
    content.Field('metadata2', { contentType: 'application/json' });
    content.File('image', { contentType: 'image/*', required: true });
  }))
  async update(context: HttpOperation.Context) {
    const reader = await context.getMultipartReader();
    const parts = await reader.getAll();
    if (parts) {

    }
  }
}
