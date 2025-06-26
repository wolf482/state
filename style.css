Install the opm CLI tool (if you haven't already):

bash
curl -L https://github.com/operator-framework/operator-registry/releases/download/v1.26.5/linux-amd64-opm -o opm
chmod +x opm
sudo mv opm /usr/local/bin/
Create an index image containing your operator bundle:

bash
opm index add \
  --bundles <your-bundle-image> \
  --tag <your-index-image> \
  --container-tool docker  # or podman
Example:

bash
opm index add \
  --bundles quay.io/myorg/my-operator-bundle:v1.0.0 \
  --tag quay.io/myorg/my-operator-index:v1.0.0 \
  --container-tool docker
Push the index image to your registry:

bash
docker push <your-index-image>
Create a CatalogSource in OpenShift:

Create a YAML file (e.g., catalogsource.yaml):

yaml
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: my-operator-catalog
  namespace: openshift-marketplace
spec:
  sourceType: grpc
  image: <your-index-image>
  displayName: My Operator Catalog
  publisher: My Org
  updateStrategy:
    registryPoll:
      interval: 30m
Apply the CatalogSource:

bash
oc apply -f catalogsource.yaml
Verify the CatalogSource is running:

bash
oc get catalogsource -n openshift-marketplace
oc get pods -n openshift-marketplace
Updating the Index Image with New Versions
When you have a new version of your operator to add:

Update the index:

bash
opm index add \
  --bundles <new-bundle-image> \
  --from-index <existing-index-image> \
  --tag <updated-index-image> \
  --container-tool docker
Push the updated index image:

bash
docker push <updated-index-image>
Update the CatalogSource to point to the new image (either edit the YAML or use oc patch).

Additional Tips
You can include multiple bundles in a single index:

bash
opm index add --bundles bundle1,bundle2,bundle3 --tag my-index
To verify the contents of your index:

bash
opm list bundles --index <your-index-image>
