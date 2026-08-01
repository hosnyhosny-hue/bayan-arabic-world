export class BayanSocialError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
