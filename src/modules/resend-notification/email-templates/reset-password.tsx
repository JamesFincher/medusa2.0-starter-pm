interface EmailTemplateProps {
  url: string;
}

export const ResetPasswordEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ url }) => {
  return (
        <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '32px',
        paddingTop: '36px',
        color: '#090909 !important',
        backgroundColor: '#F9F9F9',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px',
        }}
      >
        Forgot your password?
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: '#090909 !important',
          lineHeight: '1.5',
          marginBottom: '24px',
        }}
      >
        We received a request to reset the password for your account. Please
        click the button below to set a new password. Keep in mind, the link is
        only active for one hour.
      </p>
      <a
        href={url}
        style={{
          color: '#F9F9F9',
          textDecoration: 'none',
          marginBottom: '24px',
          display: 'block',
          backgroundColor: '#090909',
          width: '100%',
          padding: '12px 0',
          borderRadius: '999px',
          textAlign: 'center',
        }}
      >
        Reset password
      </a>
      <p
        style={{
          fontSize: '16px',
          color: '#090909 !important',
          lineHeight: '1.5',
          marginBottom: '32px',
        }}
      >
        If you did not send this request please ignore this email.
      </p>
    </div>
  );
};