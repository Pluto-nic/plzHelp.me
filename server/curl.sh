

# POST-post requests
# -v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-
echo 'POSTS NEW SERVICE PROVIDER, press any key to continue'
read input_variable
curl --data "businessName=bobsBurgers&gravatar=myGrav&firstName=bob&lastName=burger&address=123 abc st&street=123 st&phone=123-456-7890&email=me@email.com&zipcode=55060&city=owatonna&user_id=123" localhost:8080/createServiceProvider
echo 'finished posting new service provider'

echo 'POSTS NEW CLIENT, press any key to continue'
read input_variable
curl --data "firstName=Derek&lastName=Olson&email=djo@gmail.com&street=1859 creekside&city=owatonna&zipcode=55060&user_id=808&phone=507-456-2781&gravatar=noGravatar" localhost:8080/createUser
echo 'finished posting new client'

echo 'POSTS NEW PROJECT, press any key to continue'
read input_variable
  curl --data "title=blah&description=fix sink&startDate=August&endDate=September&street=123 abc st.&city=owatonna&zipcode=55060&timePosted=now&category=plumbing&ClientUserId=808" localhost:8080/createProject
echo 'finished posting new project'
#-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^- 


# UPDATE-post requests
# -v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-
# echo 'CLOSES PROJECT WITH ID=1, press any key to continue'
# read input_variable
# curl --data "id=1" localhost:8080/closeProj
# echo 'finished'

echo 'SERVICEPROVIDER ACCEPTS PROJ, press any key to continue'
read input_variable
curl --data "ServiceProviderUserId=123&id=1" localhost:8080/providerAcceptProj
echo 'finished '

#-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^- 





# GET  requests
# -v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-v-
# echo 'GET OPEN PROJECTS, press any key to continue'
# read input_variable
# curl localhost:8080/openProj
# echo 'finished retrieving open projects'



# echo 'GET CLOSED PROJECTS, press any key to continue'
# read input_variable
# curl localhost:8080/closedProj
# echo 'finished '

# echo 'GET OPEN CLIENT PROJECTS, press any key to continue'
# read input_variable
# curl -G --data "ClientId=1" localhost:8080/clientOpenProj
# echo 'finished'

# echo 'GET CLOSED CLIENT PROJECTS, press any key to continue'
# read input_variable
# curl -G --data "ClientId=1" localhost:8080/clientClosedProj
# echo 'finished'

# echo 'GET OPEN SERVICEPROVIDER PROJECTS, press any key to continue'
# read input_variable
# curl -G --data "ServiceProviderId=1" localhost:8080/providerOpenProj
# echo 'finished'

# echo 'GET CLOSED SERVICEPROVIDER PROJECTS, press any key to continue'
# read input_variable
# curl -G --data "ServiceProviderId=1" localhost:8080/providerClosedProj
# echo 'finished'

#-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^-^- 











