
FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql mysqli
RUN a2enmod rewrite

WORKDIR /var/www/html

COPY . /var/www/html/
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/brgy-entrypoint
RUN chmod +x /usr/local/bin/brgy-entrypoint

ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/brgy-entrypoint"]
CMD ["apache2-foreground"]
