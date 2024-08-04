import { ApiField, ComplexType, HttpController, HttpOperation, OmitType } from '@opra/common';
import { MultipartReader } from '@opra/core';

@ComplexType()
class AvatarMetadata {
  @ApiField({ required: true })
  declare name: string;
  @ApiField({ type: String, isArray: true })
  tags?: string[];
}

@(HttpController({
  path: 'avatar',
}).UseType(AvatarMetadata))
export class AvatarController {
  @(HttpOperation.POST({})
    .MultipartContent({}, content => {
      content.Field('name', { type: String, required: true });
      content.Field('metadata', { type: OmitType(AvatarMetadata, ['name']) });
      content.Field('metadata2', { contentType: 'application/json' });
      content.File('image', { contentType: 'image/*', required: true });
    })
    .Response(200, { type: AvatarMetadata }))
  async update(context: HttpOperation.Context) {
    const reader = await context.getMultipartReader();
    const parts = await reader.getAll();
    const part = parts.find(x => x.field === 'metadata') as MultipartReader.FieldInfo;
    return part.value;
  }
}
