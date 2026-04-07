import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Plus, Star, Trash2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmergencyContacts } from '@/hooks/useSafety';

const EmergencyContactsCard = () => {
  const { contacts, loading, addContact, updateContact, deleteContact } = useEmergencyContacts();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    await addContact({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || undefined,
      is_primary: contacts.length === 0,
    });
    setName('');
    setPhone('');
    setRelationship('');
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Emergency Contacts
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="h-8"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-2 overflow-hidden"
            >
              <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder="Phone number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
              <Input placeholder="Relationship (optional)" value={relationship} onChange={e => setRelationship(e.target.value)} />
              <Button type="submit" size="sm" className="w-full gap-2">
                <UserPlus className="h-4 w-4" /> Add Contact
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : contacts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No emergency contacts yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add contacts who will be notified in an emergency</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                    {contact.is_primary && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        <Star className="h-2.5 w-2.5 mr-0.5" /> Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  {contact.relationship && (
                    <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {!contact.is_primary && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateContact(contact.id, { is_primary: true })}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteContact(contact.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmergencyContactsCard;
