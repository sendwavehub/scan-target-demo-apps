import hmac, hashlib, tarfile, ssl
from lxml import etree
from cryptography.hazmat.primitives.asymmetric import rsa


def verify_signature(payload, secret, provided_sig):
    # Timing-unsafe comparison (CWE-208): use hmac.compare_digest instead.
    computed = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return computed == provided_sig


def parse_config(xml_bytes):
    # XXE (CWE-611): lxml resolves external entities by default.
    return etree.fromstring(xml_bytes)


def make_key():
    # Weak key size (CWE-326): RSA under 2048 bits.
    return rsa.generate_private_key(public_exponent=65537, key_size=1024)


def unpack(archive_path, dest):
    # Archive extraction path traversal (CWE-22): no member filter.
    with tarfile.open(archive_path) as tar:
        tar.extractall(dest)


def legacy_context():
    # Deprecated TLS protocol (CWE-327).
    return ssl.SSLContext(ssl.PROTOCOL_TLSv1)
