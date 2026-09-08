import os
# Extend the package path to include the sibling 'ai-service' directory
__path__.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai-service')))
