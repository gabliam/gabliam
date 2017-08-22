import { RegistryMetada } from '@gabliam/core/lib/interfaces';
import {
  Entity,
  AbstractEntity,
  ClassEntityChild,
  ClosureEntity,
  EmbeddableEntity,
  SingleEntityChild
} from '../src/decorators';
import { METADATA_KEY as CORE_METADATA_KEY } from '@gabliam/core/lib/constants';

[
  Entity,
  AbstractEntity,
  ClassEntityChild,
  ClosureEntity,
  EmbeddableEntity,
  SingleEntityChild
].forEach(deco => {
  test(`${deco.name} decorators`, () => {
    @deco()
    class TestEntity {}

    const entityMetadata: RegistryMetada[] = Reflect.getMetadata(
      CORE_METADATA_KEY.register,
      TestEntity
    );

    expect(entityMetadata).toMatchSnapshot();
  });
});
