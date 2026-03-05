-- Storage RLS policies para el bucket 'archivos'
-- Aplicar DESPUÉS de crear el bucket 'archivos' (público) en el dashboard de Supabase.
--
-- Path de archivos: {user_id}/{separador_id}/{timestamp}-{filename}
-- La política usa el primer segmento del path = user_id para verificar pertenencia.

-- Política INSERT: cada usuario sube solo a su propia carpeta (user_id como primer segmento)
CREATE POLICY "Users upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'archivos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política DELETE: cada usuario elimina solo sus propios archivos
CREATE POLICY "Users delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'archivos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
