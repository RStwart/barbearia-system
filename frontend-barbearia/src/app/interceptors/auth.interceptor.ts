import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obter token do localStorage
  const token = localStorage.getItem('token');

  // Se não houver token, apenas prossegue com a requisição original
  if (!token) {
    return next(req);
  }

  // Clonar a requisição e adicionar o header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Prosseguir com a requisição modificada
  return next(clonedRequest);
};
