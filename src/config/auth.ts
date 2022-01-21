export default {
  jwt: {
    secret: (process.env.JWT_SECRET as string) ?? 'another-secret-key',
    expiresIn: '1d'
  }
}
